import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import pino from 'pino';
import Stripe from 'stripe';
import { randomUUID } from 'node:crypto';
import { db } from './config/firebase';

const app = express();

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const PORT = Number(process.env.PORT ?? 3001);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const STRIPE_CURRENCY = 'eur';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? '';
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY ?? '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
const stripeClient = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

type JourneyProfile = 'explorer' | 'competitor' | 'collector';

type CrystalPackage = {
  id: string;
  label: string;
  amount: number;
  bonus: number;
  unitAmountCents: number;
  popular?: boolean;
};

const CRYSTAL_PACKAGES: CrystalPackage[] = [
  { id: 'pkg-starter', label: 'Starter', amount: 100, bonus: 0, unitAmountCents: 99 },
  { id: 'pkg-explorer', label: 'Explorateur', amount: 500, bonus: 50, unitAmountCents: 399, popular: true },
  { id: 'pkg-commander', label: 'Commandant', amount: 1200, bonus: 200, unitAmountCents: 799 },
  { id: 'pkg-elite', label: 'Elite', amount: 2800, bonus: 700, unitAmountCents: 1499 },
];

const formatPrice = (unitAmountCents: number) => `${(unitAmountCents / 100).toFixed(2)} €`;

const normalizeJourneyProfile = (value: unknown): JourneyProfile => {
  if (value === 'competitor' || value === 'collector') {
    return value;
  }
  return 'explorer';
};

const pickCheckoutOrigin = (originHeader: string | undefined): string => {
  if (originHeader && allowedOrigins.includes(originHeader)) {
    return originHeader;
  }
  return allowedOrigins[0] ?? 'http://localhost:5173';
};

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const incomingId = req.headers['x-request-id'];
      const id = typeof incomingId === 'string' && incomingId.length > 0 ? incomingId : randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS policy'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripeClient || !stripeWebhookSecret) {
    res.status(503).json({ error: 'Stripe webhook is not configured.' });
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    res.status(400).json({ error: 'Missing Stripe signature.' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    req.log.warn({ err: error }, 'Invalid Stripe webhook signature');
    res.status(400).json({ error: 'Invalid Stripe signature.' });
    return;
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const crystalsTotal = Number(session.metadata?.crystalsTotal ?? 0);

      await db.collection('payment_events').doc(event.id).set({
        type: event.type,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        packageId: session.metadata?.packageId ?? null,
        userId: session.metadata?.userId ?? null,
        crystalsTotal,
        amountTotal: session.amount_total ?? null,
        currency: session.currency ?? null,
        createdAt: Date.now(),
      });
    }
  } catch (error) {
    req.log.error({ err: error, eventType: event.type }, 'Stripe webhook handling failed');
    res.status(500).json({ error: 'Webhook handling failed.' });
    return;
  }

  res.status(200).json({ received: true });
});

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later.' },
});

app.use('/api', globalRateLimit);

app.get('/api/payments/config', (_req, res) => {
  const enabled = Boolean(stripeClient && stripePublishableKey);
  res.status(200).json({
    enabled,
    publishableKey: enabled ? stripePublishableKey : null,
    currency: STRIPE_CURRENCY,
  });
});

app.get('/api/payments/packages', (_req, res) => {
  res.status(200).json(
    CRYSTAL_PACKAGES.map((pkg) => ({
      id: pkg.id,
      label: pkg.label,
      amount: pkg.amount,
      bonus: pkg.bonus,
      totalCrystals: pkg.amount + pkg.bonus,
      unitAmountCents: pkg.unitAmountCents,
      price: formatPrice(pkg.unitAmountCents),
      popular: Boolean(pkg.popular),
    })),
  );
});

app.post('/api/payments/checkout-session', async (req, res) => {
  if (!stripeClient || !stripePublishableKey) {
    res.status(503).json({ error: 'Stripe is not configured on server.' });
    return;
  }

  const packageId = typeof req.body?.packageId === 'string' ? req.body.packageId : '';
  const selectedPackage = CRYSTAL_PACKAGES.find((pkg) => pkg.id === packageId);

  if (!selectedPackage) {
    res.status(400).json({ error: 'Invalid package selected.' });
    return;
  }

  const context = req.body?.context as {
    userId?: string;
    email?: string;
    locale?: string;
    themeId?: string;
    journeyProfile?: string;
  } | undefined;

  const checkoutOrigin = pickCheckoutOrigin(typeof req.headers.origin === 'string' ? req.headers.origin : undefined);
  const successUrl = typeof req.body?.successUrl === 'string'
    ? req.body.successUrl
    : `${checkoutOrigin}/boutique?payment=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = typeof req.body?.cancelUrl === 'string'
    ? req.body.cancelUrl
    : `${checkoutOrigin}/boutique?payment=cancelled`;

  const journeyProfile = normalizeJourneyProfile(context?.journeyProfile);
  const userId = context?.userId && context.userId.length > 0 ? context.userId : 'anonymous';
  const themeId = context?.themeId && context.themeId.length > 0 ? context.themeId : 'default';

  try {
    const session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: STRIPE_CURRENCY,
            unit_amount: selectedPackage.unitAmountCents,
            product_data: {
              name: `Pack Cristaux - ${selectedPackage.label}`,
              description: `${selectedPackage.amount + selectedPackage.bonus} cristaux premium pour la boutique`,
            },
          },
        },
      ],
      customer_email: context?.email,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      client_reference_id: userId,
      metadata: {
        packageId: selectedPackage.id,
        crystalsTotal: String(selectedPackage.amount + selectedPackage.bonus),
        baseAmount: String(selectedPackage.amount),
        bonusAmount: String(selectedPackage.bonus),
        userId,
        themeId,
        journeyProfile,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.status(200).json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    req.log.error({ err: error }, 'Stripe checkout session creation failed');
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

app.get('/api/payments/checkout-session/:sessionId', async (req, res) => {
  if (!stripeClient) {
    res.status(503).json({ error: 'Stripe is not configured on server.' });
    return;
  }

  const sessionId = req.params.sessionId;
  if (!sessionId) {
    res.status(400).json({ error: 'Missing session id.' });
    return;
  }

  try {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    const crystalsTotal = Number(session.metadata?.crystalsTotal ?? 0);

    res.status(200).json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      packageId: session.metadata?.packageId ?? null,
      crystalsTotal: Number.isFinite(crystalsTotal) ? crystalsTotal : 0,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
  } catch (error) {
    req.log.error({ err: error, sessionId }, 'Failed to retrieve Stripe checkout session');
    res.status(404).json({ error: 'Stripe session not found.' });
  }
});

// Endpoint pour récupérer les missions du HUD
app.get('/api/missions', async (req, res) => {
  try {
    const snapshot = await db.collection('missions').get();
    const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(missions);
  } catch (error) {
    req.log.error({ err: error }, 'Failed to fetch missions');
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'progression-backend', env: NODE_ENV });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.listen(PORT, () => {
  logger.info({ port: PORT, env: NODE_ENV }, 'Serveur Node.js securise demarre');
});