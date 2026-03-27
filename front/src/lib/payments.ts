import { loadStripe } from '@stripe/stripe-js';

export type JourneyProfile = 'explorer' | 'competitor' | 'collector';

export type PaymentPackage = {
  id: string;
  label: string;
  amount: number;
  bonus: number;
  totalCrystals: number;
  unitAmountCents: number;
  price: string;
  popular: boolean;
};

type PaymentsConfigResponse = {
  enabled: boolean;
  publishableKey: string | null;
  currency: string;
};

type CheckoutSessionResponse = {
  sessionId: string;
  checkoutUrl?: string | null;
};

type CheckoutSessionStatusResponse = {
  sessionId: string;
  paymentStatus: string | null;
  packageId: string | null;
  crystalsTotal: number;
  amountTotal: number | null;
  currency: string | null;
};

type CheckoutContext = {
  userId?: string;
  email?: string;
  locale?: string;
  themeId?: string;
  journeyProfile?: JourneyProfile;
};

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

let stripePromise: ReturnType<typeof loadStripe> | null = null;

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    const message = (data as { error?: string }).error ?? 'Payment API request failed.';
    throw new Error(message);
  }

  return data;
};

export const getPaymentPackages = async (): Promise<PaymentPackage[]> => {
  return fetchJson<PaymentPackage[]>(`${API_URL}/payments/packages`);
};

export const getPaymentConfig = async (): Promise<PaymentsConfigResponse> => {
  return fetchJson<PaymentsConfigResponse>(`${API_URL}/payments/config`);
};

const getStripeClient = async () => {
  const config = await getPaymentConfig();
  if (!config.enabled || !config.publishableKey) {
    throw new Error('Le paiement Stripe n\'est pas configure sur le serveur.');
  }

  if (!stripePromise) {
    stripePromise = loadStripe(config.publishableKey);
  }

  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Impossible de charger Stripe.js.');
  }

  return stripe;
};

export const redirectToStripeCheckout = async (
  packageId: string,
  context: CheckoutContext,
): Promise<void> => {
  const stripe = await getStripeClient();
  const session = await fetchJson<CheckoutSessionResponse>(`${API_URL}/payments/checkout-session`, {
    method: 'POST',
    body: JSON.stringify({
      packageId,
      context,
      successUrl: `${window.location.origin}/boutique?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/boutique?payment=cancelled`,
    }),
  });

  const result = await stripe.redirectToCheckout({ sessionId: session.sessionId });
  if (result.error?.message) {
    throw new Error(result.error.message);
  }
};

export const getCheckoutSessionStatus = async (sessionId: string): Promise<CheckoutSessionStatusResponse> => {
  return fetchJson<CheckoutSessionStatusResponse>(`${API_URL}/payments/checkout-session/${encodeURIComponent(sessionId)}`);
};
