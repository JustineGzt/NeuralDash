import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MissionCard } from '../components/MissionCard';
import { SignalBars } from '../components/SignalBars';
import { AvatarGlobal } from '../components/Avatar/AvatarGlobal'; // Vérifie bien le nom du fichier
import { AvatarBesoins } from '../components/Avatar/AvatarBesoins'; // On importe le nouveau composant
import { missions } from '../data/missions';
import type { StatsInput } from '../utils/emotionLogic';
import { TopHeader } from '../components/TopHeader';
import { XpPanel } from '../components/XpPanel';
import { useAuth } from '../hooks/useAuth';
import { useNeeds } from '../hooks/useNeeds';

type GoalCategory = 'big' | 'basic' | 'health';

type Goal = {
  id: string;
  label: string;
  done: boolean;
};

type WishlistItem = {
  id: string;
  label: string;
};

type RewardHistoryEntry = {
  id: string;
  gain: number;
  selectedItem: string;
  date: string;
};

const STORAGE_KEYS = {
  bigGoals: 'home_big_goals_v1',
  basicGoals: 'home_basic_goals_v1',
  healthGoals: 'home_health_goals_v1',
  wishlist: 'home_wishlist_v1',
  history: 'home_reward_history_v1',
  usedSpins: 'home_used_spins_v1',
};

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write errors (private mode/full storage).
  }
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const drawMoneyGain = () => {
  const r = Math.random();
  if (r < 0.5) return Math.floor(Math.random() * 5) + 1;
  if (r < 0.9) return Math.floor(Math.random() * 44) + 6;
  return Math.floor(Math.random() * 51) + 50;
};

const categoryConfig: Record<GoalCategory, { title: string; color: string; ratio: number }> = {
  big: { title: 'Gros objectifs', color: 'from-fuchsia-500 to-pink-500', ratio: 1 },
  basic: { title: 'Objectifs basiques', color: 'from-cyan-500 to-sky-500', ratio: 3 },
  health: { title: 'Objectifs sante', color: 'from-emerald-500 to-lime-500', ratio: 5 },
};

const getProgress = (goals: Goal[]) => {
  if (goals.length === 0) return 0;
  const done = goals.filter((goal) => goal.done).length;
  return Math.round((done / goals.length) * 100);
};

export const Home = () => {
  const { user, signOut } = useAuth();
  const { needs } = useNeeds();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(true);
  const [bigGoals, setBigGoals] = useState<Goal[]>(() => readStorage(STORAGE_KEYS.bigGoals, []));
  const [basicGoals, setBasicGoals] = useState<Goal[]>(() => readStorage(STORAGE_KEYS.basicGoals, []));
  const [healthGoals, setHealthGoals] = useState<Goal[]>(() => readStorage(STORAGE_KEYS.healthGoals, []));
  const [goalDrafts, setGoalDrafts] = useState<Record<GoalCategory, string>>({
    big: '',
    basic: '',
    health: '',
  });
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => readStorage(STORAGE_KEYS.wishlist, []));
  const [wishlistOpen, setWishlistOpen] = useState(true);
  const [wishlistDraft, setWishlistDraft] = useState('');
  const [history, setHistory] = useState<RewardHistoryEntry[]>(() => readStorage(STORAGE_KEYS.history, []));
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [usedSpins, setUsedSpins] = useState<number>(() => readStorage(STORAGE_KEYS.usedSpins, 0));
  const [isPickingWishlist, setIsPickingWishlist] = useState(false);
  const [wishlistPreviewIndex, setWishlistPreviewIndex] = useState(0);
  const [lastResult, setLastResult] = useState<{ gain: number; item: string } | null>(null);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.bigGoals, bigGoals);
  }, [bigGoals]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.basicGoals, basicGoals);
  }, [basicGoals]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.healthGoals, healthGoals);
  }, [healthGoals]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.wishlist, wishlist);
  }, [wishlist]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.history, history);
  }, [history]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.usedSpins, usedSpins);
  }, [usedSpins]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  const userStats: StatsInput = {
    health: Math.round((needs.hunger + needs.thirst + needs.mood) / 3),
    energy: needs.energy,
    system: needs.productivity,
    power: Math.round((needs.energy + needs.productivity) / 2),
    shield: Math.round((needs.hunger + needs.mood) / 2),
    focus: needs.focus,
  };

  const pulse = Math.round(72 + (100 - needs.energy) * 0.35 + (100 - needs.mood) * 0.15);
  const temperature = (36.4 + (100 - needs.thirst) * 0.012).toFixed(1);

  const completedBigGoals = bigGoals.filter((goal) => goal.done).length;
  const completedBasicGoals = basicGoals.filter((goal) => goal.done).length;
  const completedHealthGoals = healthGoals.filter((goal) => goal.done).length;

  const totalAvailableSpins = useMemo(
    () => completedBigGoals + Math.floor(completedBasicGoals / 3) + Math.floor(completedHealthGoals / 5),
    [completedBigGoals, completedBasicGoals, completedHealthGoals],
  );
  const remainingSpins = Math.max(totalAvailableSpins - usedSpins, 0);
  const totalGain = history.reduce((sum, entry) => sum + entry.gain, 0);

  const addGoal = (category: GoalCategory) => {
    const value = goalDrafts[category].trim();
    if (!value) return;

    const newGoal: Goal = { id: makeId(), label: value, done: false };
    if (category === 'big') setBigGoals((prev) => [newGoal, ...prev]);
    if (category === 'basic') setBasicGoals((prev) => [newGoal, ...prev]);
    if (category === 'health') setHealthGoals((prev) => [newGoal, ...prev]);

    setGoalDrafts((prev) => ({ ...prev, [category]: '' }));
  };

  const toggleGoal = (category: GoalCategory, id: string) => {
    const toggle = (goal: Goal) => (goal.id === id ? { ...goal, done: !goal.done } : goal);
    if (category === 'big') setBigGoals((prev) => prev.map(toggle));
    if (category === 'basic') setBasicGoals((prev) => prev.map(toggle));
    if (category === 'health') setHealthGoals((prev) => prev.map(toggle));
  };

  const removeGoal = (category: GoalCategory, id: string) => {
    const filter = (goals: Goal[]) => goals.filter((goal) => goal.id !== id);
    if (category === 'big') setBigGoals(filter);
    if (category === 'basic') setBasicGoals(filter);
    if (category === 'health') setHealthGoals(filter);
  };

  const addWishlistItem = () => {
    const value = wishlistDraft.trim();
    if (!value) return;
    setWishlist((prev) => [{ id: makeId(), label: value }, ...prev]);
    setWishlistDraft('');
  };

  const removeWishlistItem = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const canSpin = !isSpinning && remainingSpins > 0 && wishlist.length > 0;

  const launchSpin = async () => {
    if (!canSpin) return;

    setIsSpinning(true);
    setUsedSpins((prev) => prev + 1);
    setWheelRotation((prev) => prev + 1260 + Math.floor(Math.random() * 360));

    await new Promise((resolve) => setTimeout(resolve, 1900));

    const gain = drawMoneyGain();
    let selectedItem = 'Aucun objet (wishlist vide)';

    if (wishlist.length > 0) {
      setIsPickingWishlist(true);
      for (let i = 0; i < 16; i += 1) {
        setWishlistPreviewIndex(i % wishlist.length);
        // Duree variable pour simuler une roue secondaire.
        await new Promise((resolve) => setTimeout(resolve, 60 + i * 10));
      }

      const selectedIndex = Math.floor(Math.random() * wishlist.length);
      selectedItem = wishlist[selectedIndex].label;
      setWishlistPreviewIndex(selectedIndex);
      await new Promise((resolve) => setTimeout(resolve, 220));
      setIsPickingWishlist(false);
    }

    const entry: RewardHistoryEntry = {
      id: makeId(),
      gain,
      selectedItem,
      date: new Date().toLocaleString('fr-FR'),
    };

    setHistory((prev) => [entry, ...prev].slice(0, 40));
    setLastResult({ gain, item: selectedItem });
    setIsSpinning(false);
  };

  const goalSections: Array<{ category: GoalCategory; goals: Goal[]; completed: number }> = [
    { category: 'big', goals: bigGoals, completed: completedBigGoals },
    { category: 'basic', goals: basicGoals, completed: completedBasicGoals },
    { category: 'health', goals: healthGoals, completed: completedHealthGoals },
  ];

  return (
    <div className="min-h-screen bg-[#03070b] text-cyan-200 flex items-center justify-center px-3 sm:px-4 lg:px-6 pt-6 sm:pt-10 pb-28 sm:pb-32">
      <div className="relative w-full max-w-6xl">
        {/* Effets de fond (inchangés) */}
        <div className="absolute -inset-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, rgba(34,211,238,0.35) 1px, transparent 1px), linear-gradient(rgba(34,211,238,0.35) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 border border-cyan-500/30 rounded-3xl bg-[#050b12]/80 backdrop-blur-xl p-4 sm:p-6 lg:p-10 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          {user ? (
            <div className="mb-4 sm:mb-5 flex justify-end">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-2.5 py-1.5 sm:px-3 sm:py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan-100 transition-all hover:border-cyan-300/80 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                {isSigningOut ? 'Deconnexion...' : 'Deconnexion'}
              </button>
            </div>
          ) : null}

          <TopHeader />
          <div className="mt-4 sm:mt-5">
            <SignalBars values={[45, 70, 55, 80, 65, 90, 75, 50]} />
          </div>

          <div className="mt-6 sm:mt-8 grid gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-[1.1fr,1fr,1.1fr] items-start">
            
            {/* COLONNE GAUCHE : Utilisation de AvatarBesoins pour un look plus RPG */}
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <AvatarBesoins stats={userStats} needs={needs} />
            </div>

            {/* COLONNE CENTRE : Avatar Global */}
            <div className="order-1 md:col-span-2 lg:col-span-1 lg:order-2 flex justify-center">
              <AvatarGlobal stats={userStats} />
            </div>

            {/* COLONNE DROITE : Signes vitaux et Signaux */}
            <div className="order-3 lg:order-3 space-y-4 sm:space-y-6">
              <XpPanel initialTotalXp={0} />
              <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-200/60">Signes vitaux</p>
                <div className="mt-4 flex items-center justify-between text-xs text-cyan-100">
                  <span>Pouls</span>
                  <span className="text-emerald-300">{pulse} bpm</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-cyan-100">
                  <span>Température</span>
                  <span className="text-cyan-300">{temperature} C</span>
                </div>
              </div>
              <SignalBars values={[82, 64, 92, 48, 78]} />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-400/30 bg-black/30 p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setGoalsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-cyan-300/30 bg-cyan-500/5 px-4 py-3 text-left transition hover:border-cyan-300/70 hover:bg-cyan-500/10"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-100/80">Suivi des objectifs</p>
                <p className="mt-1 text-xs text-cyan-100/70">
                  {completedBigGoals + completedBasicGoals + completedHealthGoals} objectifs completes
                </p>
              </div>
              <span className="text-sm text-cyan-200">{goalsOpen ? 'Fermer' : 'Ouvrir'}</span>
            </button>

            {goalsOpen ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {goalSections.map(({ category, goals, completed }) => (
                  <section key={category} className="rounded-xl border border-cyan-400/20 bg-[#06121b]/70 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-cyan-100">{categoryConfig[category].title}</h3>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">
                        {completed}/{goals.length}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan-950/60">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${categoryConfig[category].color} transition-all duration-500`}
                        style={{ width: `${getProgress(goals)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-cyan-100/65">
                      1 tour tous les {categoryConfig[category].ratio} objectifs valides
                    </p>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={goalDrafts[category]}
                        onChange={(event) => setGoalDrafts((prev) => ({ ...prev, [category]: event.target.value }))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') addGoal(category);
                        }}
                        className="w-full rounded-lg border border-cyan-300/25 bg-black/40 px-3 py-2 text-xs text-cyan-100 outline-none ring-0 placeholder:text-cyan-200/35 focus:border-cyan-300/60"
                        placeholder="Ajouter un objectif"
                      />
                      <button
                        type="button"
                        onClick={() => addGoal(category)}
                        className="rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 text-xs text-cyan-50 transition hover:bg-cyan-400/20"
                      >
                        +
                      </button>
                    </div>

                    <ul className="mt-3 space-y-2 max-h-48 overflow-auto pr-1">
                      {goals.map((goal) => (
                        <li
                          key={goal.id}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition ${
                            goal.done
                              ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100'
                              : 'border-cyan-500/25 bg-black/30 text-cyan-100'
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={goal.done}
                              onChange={() => toggleGoal(category, goal.id)}
                              className="h-4 w-4 shrink-0 rounded border-cyan-500/40 bg-transparent accent-emerald-400"
                            />
                            <span className={`truncate ${goal.done ? 'line-through opacity-80' : ''}`}>{goal.label}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeGoal(category, goal.id)}
                            className="ml-2 shrink-0 rounded border border-rose-300/30 bg-rose-400/10 px-2 py-0.5 text-[10px] text-rose-200 hover:bg-rose-400/25 transition"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                      {goals.length === 0 ? (
                        <li className="rounded-lg border border-dashed border-cyan-500/30 px-3 py-2 text-xs text-cyan-200/55">
                          Aucun objectif pour cette categorie.
                        </li>
                      ) : null}
                    </ul>
                  </section>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2 items-start">
            <section className={`rounded-2xl border border-cyan-500/25 bg-[#071019]/80 transition-all duration-300 ${wishlistOpen ? 'p-4 sm:p-5' : 'p-3 sm:p-4'}`}>
              <button
                type="button"
                onClick={() => setWishlistOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-xl border border-cyan-300/30 bg-cyan-500/5 px-3 py-2 text-left transition hover:border-cyan-300/70 hover:bg-cyan-500/10"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-100/70">Liste de souhaits</p>
                  <p className="mt-1 text-xs text-cyan-100/65">{wishlist.length} objet(s)</p>
                </div>
                <span className="text-xs text-cyan-200">{wishlistOpen ? 'Fermer' : 'Ouvrir'}</span>
              </button>

              {wishlistOpen ? (
                <>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={wishlistDraft}
                      onChange={(event) => setWishlistDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') addWishlistItem();
                      }}
                      className="w-full rounded-lg border border-cyan-300/25 bg-black/40 px-3 py-2 text-xs text-cyan-100 outline-none placeholder:text-cyan-200/40 focus:border-cyan-300/60"
                      placeholder="Ex: Souris, casque, clavier"
                    />
                    <button
                      type="button"
                      onClick={addWishlistItem}
                      className="rounded-lg border border-cyan-300/40 bg-cyan-500/10 px-3 text-xs text-cyan-100 transition hover:bg-cyan-500/20"
                    >
                      Ajouter
                    </button>
                  </div>

                  <ul className="mt-4 space-y-2 max-h-52 overflow-auto pr-1">
                    {wishlist.map((item, index) => (
                      <li
                        key={item.id}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition ${
                          isPickingWishlist && wishlistPreviewIndex === index
                            ? 'border-amber-300/80 bg-amber-400/20 text-amber-100'
                            : 'border-cyan-500/30 bg-black/35 text-cyan-100/90'
                        }`}
                      >
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={() => removeWishlistItem(item.id)}
                          className="rounded-md border border-rose-300/35 bg-rose-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-rose-100 hover:bg-rose-400/20"
                        >
                          Retirer
                        </button>
                      </li>
                    ))}
                    {wishlist.length === 0 ? (
                      <li className="rounded-lg border border-dashed border-cyan-500/30 px-3 py-2 text-xs text-cyan-200/55">
                        Ajoute des objets a tirer apres chaque gain.
                      </li>
                    ) : null}
                  </ul>

                </>
              ) : (
                <p className="mt-3 text-xs text-cyan-100/60">Bloc reduit. Clique sur Ouvrir pour afficher la liste de souhaits.</p>
              )}
            </section>

            <section className="rounded-2xl border border-cyan-400/35 bg-[#070e16]/85 p-5 sm:p-6 flex flex-col items-center">
              <p className="text-[10px] uppercase tracking-[0.45em] text-cyan-100/65">Roulette centrale</p>
              <p className="mt-2 text-sm text-cyan-100">
                Tours disponibles: <span className="font-bold text-emerald-300">{remainingSpins}</span>
              </p>
              {remainingSpins > 0 && wishlist.length === 0 ? (
                <p className="mt-1 text-xs text-amber-300/90">Ajoute au moins un objet dans la liste de souhaits pour activer la roulette.</p>
              ) : null}
              {remainingSpins === 0 ? (
                <p className="mt-1 text-xs text-rose-300/90">Complete des objectifs pour gagner des tours.</p>
              ) : null}

              <div className="mt-5 relative">
                <div className="absolute -inset-5 rounded-full bg-cyan-500/10 blur-xl" />
                <div
                  className="relative h-56 w-56 rounded-full border-10 border-cyan-300/45 shadow-[0_0_40px_rgba(34,211,238,0.28)]"
                  style={{ transform: `rotate(${wheelRotation}deg)`, transition: 'transform 1.9s cubic-bezier(0.12, 0.8, 0.2, 1)' }}
                >
                  <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#3b82f6_0_20%,#0ea5e9_20_40%,#22d3ee_40_60%,#14b8a6_60_80%,#f59e0b_80_90%,#ef4444_90_100%)]" />
                  <div className="absolute inset-4 rounded-full border border-black/30 bg-black/30 backdrop-blur-sm" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border border-cyan-200/55 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                      SPIN
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 -top-3.5 -translate-x-1/2 h-0 w-0 border-l-12 border-r-12 border-t-18 border-l-transparent border-r-transparent border-t-amber-300" />
              </div>

              <button
                type="button"
                onClick={launchSpin}
                disabled={!canSpin}
                className="mt-5 rounded-xl border border-cyan-200/60 bg-cyan-400/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-50 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSpinning ? 'Roulette en cours...' : 'Lancer la roulette'}
              </button>

              <div className="mt-4 w-full rounded-xl border border-cyan-500/20 bg-black/30 p-3 text-xs text-cyan-100/85">
                <p>Regles de conversion:</p>
                <p className="mt-1 text-cyan-100/70">1 gros = 1 tour | 3 basiques = 1 tour | 5 sante = 1 tour</p>
                <p className="mt-2 text-cyan-100/70">Total gains: <span className="font-semibold text-emerald-300">{totalGain} EUR</span></p>
              </div>

              {lastResult ? (
                <div className="mt-4 w-full rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                  <p className="uppercase tracking-[0.16em] text-[10px] text-emerald-200/80">Dernier resultat</p>
                  <p className="mt-1">Gain: {lastResult.gain} EUR</p>
                  <p className="mt-1">Objet: {lastResult.item}</p>
                </div>
              ) : null}
            </section>
          </div>

          <section className="rounded-2xl border border-cyan-500/25 bg-[#071019]/80 p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-100/70">Historique gains + objets</p>
              <ul className="mt-4 space-y-2 max-h-104 overflow-auto pr-1">
                {history.map((entry) => (
                  <li key={entry.id} className="rounded-lg border border-cyan-500/25 bg-black/35 px-3 py-3 text-xs text-cyan-100/90">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-300">+{entry.gain} EUR</span>
                      <span className="text-cyan-100/55">{entry.date}</span>
                    </div>
                    <p className="mt-1 text-cyan-100/80">Objet selectionne: {entry.selectedItem}</p>
                  </li>
                ))}
                {history.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-cyan-500/30 px-3 py-2 text-xs text-cyan-200/55">
                    Aucun tirage pour le moment.
                  </li>
                ) : null}
              </ul>
          </section>
          </div>

          {/* Journal de mission (Le reste est inchangé) */}
          <div className="relative mt-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-500/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#050b12] px-5 text-[10px] font-black uppercase tracking-[0.5em] text-cyan-200/70">
                Journal de mission
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};