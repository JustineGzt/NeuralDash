import { useEffect, useMemo, useState } from 'react';
import { TopHeader } from '../components/TopHeader';
import { useMissions } from '../hooks/useMissions';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import {
  getStorageScopeId,
  getScopedStorageItem,
  removeScopedStorageItem,
  setScopedStorageItem,
} from '../utils/userStorage';
import {
  createSpaceBattle,
  getShipCombatant,
  resolveSpaceBattleTurn,
  SPACE_ENEMIES,
  type ShipAction,
  type SpaceBattleState,
} from '../utils/spaceBattle';

const XP_STORAGE_KEY = 'playerXpTotal';
const XP_EVENT = 'xp:updated';

const STAGES = [
  { id: 's1', title: 'Portail Echo', status: 'Actif', progress: 68 },
  { id: 's2', title: 'Canyon de Verre', status: 'Verrouille', progress: 20 },
  { id: 's3', title: 'Sanctuaire Cobalt', status: 'Inconnu', progress: 0 },
];

type Objective = {
  id: string;
  title: string;
  reward: string;
  requirements: Array<{ id: string; name: string; icon: string }>;
  requiresAnyShip?: boolean;
};

const INITIAL_OBJECTIVES: Objective[] = [
  {
    id: 't1',
    title: 'Cartographier 3 zones',
    reward: '+40 XP',
    requirements: [
      { id: 'starter-compass-01', name: 'Boussole', icon: '🧭' },
      { id: 'starter-drone-01', name: 'Drone', icon: '🛰️' },
      { id: 'starter-beacon-01', name: 'Balises', icon: '📍' }
    ]
  },
  {
    id: 't2',
    title: 'Recuperer un artefact',
    reward: 'Module rare',
    requirements: [
      { id: 'starter-glove-01', name: 'Gant', icon: '🧤' },
      { id: 'starter-prism-01', name: 'Prisme', icon: '🔷' },
      { id: 'starter-probe-01', name: 'Sonde', icon: '📡' }
    ]
  },
  {
    id: 't3',
    title: 'Analyser une anomalie',
    reward: 'Focus +8%',
    requirements: [
      { id: 'starter-analyzer-01', name: 'Analyseur', icon: '🧿' },
      { id: 'starter-sensor-01', name: 'Capteur', icon: '📟' },
      { id: 'starter-filter-01', name: 'Filtre', icon: '🧫' }
    ]
  },
  {
    id: 't4',
    title: 'Acheter un vaisseau',
    reward: 'Hangar active',
    requirements: [],
    requiresAnyShip: true
  }
];

const CREW = [
  { id: 'c1', name: 'Scout V-9', role: 'Eclaireur', status: 'En patrouille' },
  { id: 'c2', name: 'Aegis Core', role: 'Defense', status: 'Bouclier actif' },
  { id: 'c3', name: 'Drift Node', role: 'Support', status: 'Transfert stable' },
];

const ADVENTURE_TARGETS = [
  'Reduisez la latence du reseau neural en optimisant les canaux de communication.',
  'Lancez un diagnostic complet et retablissez les connexions cellulaires endommagees.',
  'Etablissez une connexion securisee avec le serveur maitre et telechargez les mises a jour critiques.',
  "Detectez et eliminez tous les parasites nanotech qui s'installent dans les systeme.",
  'Debloquez de nouveaux emplacements de stockage neural en optimisant la compression des donnees.'
];

const MISSION_REQUIREMENTS: Record<string, Array<{ id: string; name: string; icon: string }>> = {
  'Reduisez la latence du reseau neural en optimisant les canaux de communication.': [
    { id: 'req-module-signal', name: 'Module Signal', icon: '📡' },
    { id: 'req-cable-ether', name: 'Cable Ether', icon: '🔌' }
  ],
  'Lancez un diagnostic complet et retablissez les connexions cellulaires endommagees.': [
    { id: 'req-kit-diagnosis', name: 'Kit Diagnostic', icon: '🧪' },
    { id: 'req-repair-gel', name: 'Gel Regenerant', icon: '🧬' }
  ],
  'Etablissez une connexion securisee avec le serveur maitre et telechargez les mises a jour critiques.': [
    { id: 'req-cle-crypt', name: 'Cle Crypt', icon: '🔑' },
    { id: 'req-core-relay', name: 'Noyau Relais', icon: '💠' }
  ],
  "Detectez et eliminez tous les parasites nanotech qui s'installent dans les systeme.": [
    { id: 'req-scan-lens', name: 'Lentille Scan', icon: '🧿' },
    { id: 'req-nano-purge', name: 'Purge Nano', icon: '🧫' }
  ],
  'Debloquez de nouveaux emplacements de stockage neural en optimisant la compression des donnees.': [
    { id: 'req-mem-crystal', name: 'Cristal Memoire', icon: '💎' },
    { id: 'req-data-core', name: 'Noyau Data', icon: '🧠' }
  ]
};

export const Aventure = () => {
  const { user, loading: authLoading } = useAuth();
  const { quests, completeMission } = useMissions();
  const { inventory } = useInventory();
  const { addCredits } = useWallet();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [objectives, setObjectives] = useState(INITIAL_OBJECTIVES);
  const [equippedShipId, setEquippedShipId] = useState<string | null>(null);
  const [battle, setBattle] = useState<SpaceBattleState | null>(null);
  const storageScope = getStorageScopeId(user?.uid);

  const adventureMissions = quests.filter((quest) =>
    quest.description && ADVENTURE_TARGETS.includes(quest.description)
  );

  const inventoryLookup = useMemo(() => {
    const lookup = new Map<string, number>();
    inventory.forEach((item) => {
      const count = item.count ?? 0;
      if (count <= 0) return;
      lookup.set(item.id, count);
      lookup.set(item.name.toLowerCase(), count);
    });
    return lookup;
  }, [inventory]);

  const hasRequiredItem = (item: { id: string; name: string }) =>
    (inventoryLookup.get(item.id) ?? 0) > 0 ||
    (inventoryLookup.get(item.name.toLowerCase()) ?? 0) > 0;

  const shipInventory = useMemo(
    () => inventory.filter((item) => item.type?.toLowerCase() === 'vaisseau'),
    [inventory]
  );

  const equippedShip = useMemo(
    () => shipInventory.find((ship) => ship.id === equippedShipId) ?? null,
    [equippedShipId, shipInventory]
  );

  useEffect(() => {
    if (authLoading) return;
    const stored = getScopedStorageItem('equippedShip', user?.uid);
    setEquippedShipId(stored ?? null);
  }, [authLoading, user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    if (!equippedShipId) return;
    const stillOwned = shipInventory.some((ship) => ship.id === equippedShipId);
    if (!stillOwned) {
      setEquippedShipId(null);
      removeScopedStorageItem('equippedShip', user?.uid);
    }
  }, [authLoading, equippedShipId, shipInventory, user?.uid]);

  const hasAnyShip = shipInventory.length > 0;

  const canCompleteObjective = (objective: Objective) => {
    if (objective.requiresAnyShip) return hasAnyShip;
    return objective.requirements.length === 0 || objective.requirements.every((item) => hasRequiredItem(item));
  };

  const hangarUnlocked = objectives.every((objective) => objective.id !== 't4');

  const handleCompleteObjective = (objectiveId: string) => {
    const target = objectives.find((objective) => objective.id === objectiveId);
    if (!target) return;

    if (!canCompleteObjective(target)) {
      setErrorMessage('Objets requis manquants pour cette mission.');
      setTimeout(() => setErrorMessage(null), 2500);
      return;
    }

    setObjectives((prev) => prev.filter((objective) => objective.id !== objectiveId));
    setSuccessMessage('Mission immediate terminee.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleEquipShip = (shipId: string) => {
    setEquippedShipId(shipId);
    setScopedStorageItem('equippedShip', shipId, user?.uid);
    setSuccessMessage('Vaisseau equipe.');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const grantBattleRewards = (creditsGain: number, xpGain: number) => {
    if (creditsGain > 0) {
      addCredits(creditsGain);
    }

    if (xpGain > 0) {
      const currentXp = Number(getScopedStorageItem(XP_STORAGE_KEY, user?.uid)) || 0;
      const nextXp = currentXp + xpGain;
      setScopedStorageItem(XP_STORAGE_KEY, String(nextXp), user?.uid);
      window.dispatchEvent(
        new CustomEvent(XP_EVENT, {
          detail: {
            totalXp: nextXp,
            gain: xpGain,
            scope: storageScope,
          },
        })
      );
    }
  };

  const startBattle = (enemyId: string) => {
    if (!equippedShip) return;
    const nextBattle = createSpaceBattle(equippedShip, enemyId);
    if (!nextBattle) return;
    setBattle(nextBattle);
  };

  const resolveBattle = (playerAction: ShipAction) => {
    if (!battle) return;

    const nextBattle = resolveSpaceBattleTurn(battle, playerAction);

    if (!battle.winner && nextBattle.winner === 'player') {
      grantBattleRewards(nextBattle.rewardCredits, nextBattle.rewardXp);
      setSuccessMessage(
        `Combat gagne: +${nextBattle.rewardCredits} credits • +${nextBattle.rewardXp} XP`
      );
      setTimeout(() => setSuccessMessage(null), 3200);
    }

    if (!battle.winner && nextBattle.winner === 'enemy') {
      setErrorMessage('Combat perdu. Reparez le vaisseau et tentez une autre approche.');
      setTimeout(() => setErrorMessage(null), 3200);
    }

    setBattle(nextBattle);
  };

  const closeBattle = () => {
    setBattle(null);
  };

  const handleComplete = async (questId: string) => {
    setErrorMessage(null);
    try {
      const result = await completeMission(questId);
      if (result.reward) {
        setSuccessMessage(`🎯 Mission terminee: ${result.reward.name}`);
      } else {
        setSuccessMessage('🎯 Mission terminee');
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-amber-100 px-4 py-10">
      <div className="relative max-w-6xl mx-auto">
        <div className="absolute -inset-8 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),transparent_65%)]" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(120deg, rgba(148,163,184,0.25) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative z-10 border border-amber-300/30 rounded-[28px] bg-[#0b0f14]/80 backdrop-blur-xl p-6 md:p-10 shadow-[0_0_45px_rgba(10,10,10,0.8)]">
          <TopHeader />

          {successMessage && (
            <div className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
            <section className="rounded-2xl border border-amber-300/30 bg-[#0f141c]/90 p-6 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.45em] text-amber-100/95">Mission en cours</p>
                  <h1 className="mt-2 text-2xl md:text-3xl font-black uppercase text-amber-100">Operation Sables Or</h1>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/95">Energie</p>
                  <p className="text-lg font-semibold text-amber-200">74%</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {STAGES.map((stage) => (
                  <div key={stage.id} className="rounded-xl border border-amber-300/20 bg-black/40 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/90">{stage.title}</p>
                    <p className="mt-2 text-sm font-semibold text-amber-100">{stage.status}</p>
                    <div className="mt-3 h-2 rounded-full border border-amber-300/20 bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-amber-300 via-orange-300 to-emerald-300"
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-amber-100/90">{stage.progress}%</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-amber-300/20 bg-black/50 p-5">
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-100/90">Objectifs immediats</p>
                <div className="mt-4 space-y-3">
                  {objectives.length === 0 ? (
                    <p className="text-sm text-amber-100/85">Tous les objectifs sont completes.</p>
                  ) : (
                    objectives.map((target) => {
                      const canComplete = canCompleteObjective(target);
                      return (
                        <div key={target.id} className="rounded-lg border border-amber-300/15 bg-black/40 px-3 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-amber-100">{target.title}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] uppercase tracking-[0.25em] text-amber-300">{target.reward}</span>
                              <button
                                onClick={() => handleCompleteObjective(target.id)}
                                disabled={!canComplete}
                                className={`rounded-lg border px-2.5 py-1 text-[9px] uppercase tracking-[0.3em] transition ${
                                  canComplete
                                    ? 'border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
                                    : 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                                }`}
                              >
                                Remplir
                              </button>
                            </div>
                          </div>

                          {(target.requirements.length > 0 || target.requiresAnyShip) && (
                            <div className="mt-3">
                              <p className="text-[9px] uppercase tracking-[0.35em] text-amber-100/90">Objets requis</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {target.requiresAnyShip && (
                                  <div
                                    className={`flex items-center gap-2 rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.25em] transition ${
                                      hasAnyShip
                                        ? 'border-amber-300/40 text-amber-100 bg-amber-400/10'
                                        : 'border-white/10 text-white/30 bg-black/30 grayscale opacity-60'
                                    }`}
                                  >
                                    <span className="text-base">🚀</span>
                                    <span>Vaisseau</span>
                                  </div>
                                )}
                                {target.requirements.map((item) => {
                                  const available = hasRequiredItem(item);
                                  return (
                                    <div
                                      key={item.id}
                                      className={`flex items-center gap-2 rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.25em] transition ${
                                        available
                                          ? 'border-amber-300/40 text-amber-100 bg-amber-400/10'
                                          : 'border-white/10 text-white/30 bg-black/30 grayscale opacity-60'
                                      }`}
                                    >
                                      <span className="text-base">{item.icon}</span>
                                      <span>{item.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300/20 bg-black/50 p-5">
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-100/90">Equipe active</p>
                <div className="mt-4 space-y-3">
                  {CREW.map((member) => (
                    <div key={member.id} className="rounded-lg border border-amber-300/15 bg-black/40 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-100">{member.name}</span>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-amber-300/80">{member.role}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-amber-100/85 uppercase tracking-[0.25em]">{member.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-amber-300/20 bg-black/40 p-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-100/90">Anomalies detectees</p>
              <span className="text-[9px] uppercase tracking-[0.4em] text-amber-300">Niveau 2</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {['Echo breche', 'Flux instable', 'Signal parasite'].map((label) => (
                <div key={label} className="rounded-lg border border-amber-300/20 bg-black/60 p-4">
                  <p className="text-sm text-amber-100 font-semibold">{label}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-amber-100/90">Analyse en attente</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-amber-300/20 bg-black/50 p-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-100/90">Missions neurales</p>
              <span className="text-[9px] uppercase tracking-[0.4em] text-amber-300">
                {adventureMissions.length} trouvees
              </span>
            </div>

            {adventureMissions.length === 0 ? (
              <p className="mt-4 text-sm text-amber-100/85">Aucune mission chargee pour l'aventure.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {adventureMissions.map((mission) => (
                  <div
                    key={mission.id}
                    className={`rounded-xl border border-amber-300/20 bg-black/60 p-4 transition ${
                      (MISSION_REQUIREMENTS[mission.description ?? ''] ?? []).every((item) => hasRequiredItem(item))
                        ? 'opacity-100'
                        : 'opacity-60 grayscale'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-amber-100">{mission.title}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
                          {mission.description}
                        </p>
                      </div>
                      {mission.completed ? (
                        <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-300">Completee</span>
                      ) : (
                        <button
                          onClick={() => handleComplete(mission.id)}
                          disabled={!(MISSION_REQUIREMENTS[mission.description ?? ''] ?? []).every((item) => hasRequiredItem(item))}
                          className={`rounded-lg border px-3 py-1 text-[9px] uppercase tracking-[0.3em] transition ${
                            (MISSION_REQUIREMENTS[mission.description ?? ''] ?? []).every((item) => hasRequiredItem(item))
                              ? 'border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
                              : 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          Terminer
                        </button>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-[9px] uppercase tracking-[0.35em] text-amber-200/50">Objets requis</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(MISSION_REQUIREMENTS[mission.description ?? ''] ?? []).map((item) => {
                          const available = hasRequiredItem(item);
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center gap-2 rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.25em] transition ${
                                available
                                  ? 'border-amber-300/40 text-amber-100 bg-amber-400/10'
                                  : 'border-white/10 text-white/30 bg-black/30 grayscale opacity-60'
                              }`}
                            >
                              <span className="text-base">{item.icon}</span>
                              <span>{item.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {mission.reward && (
                <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-amber-100/95">
                        Recompense: {mission.reward.icon} {mission.reward.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {hangarUnlocked && (
            <section className="mt-8 rounded-2xl border border-amber-300/20 bg-black/50 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60">Hangar</p>
                <span className="text-[9px] uppercase tracking-[0.4em] text-amber-300">{shipInventory.length} vaisseaux</span>
              </div>

              {shipInventory.length === 0 ? (
                <p className="mt-4 text-sm text-amber-200/60">Aucun vaisseau en inventaire.</p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {shipInventory.map((ship) => (
                    <div key={ship.id} className="rounded-xl border border-amber-300/20 bg-black/60 p-4">
                      {(() => {
                        const profile = getShipCombatant(ship);
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-lg">{ship.icon}</p>
                                <p className="text-sm font-semibold text-amber-100">{ship.name}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-amber-200/60">{ship.type}</p>
                              </div>
                              <button
                                onClick={() => handleEquipShip(ship.id)}
                                className={`rounded-lg border px-2.5 py-1 text-[9px] uppercase tracking-[0.3em] transition ${
                                  equippedShipId === ship.id
                                    ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200'
                                    : 'border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
                                }`}
                              >
                                {equippedShipId === ship.id ? 'Equipe' : 'Equiper'}
                              </button>
                            </div>
                            {ship.desc && (
                              <p className="mt-2 text-[10px] text-amber-200/60">{ship.desc}</p>
                            )}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] uppercase tracking-[0.22em] text-amber-200/70">
                              <div className="rounded-lg border border-amber-300/15 bg-black/40 px-2 py-2">Coque {profile.maxHull}</div>
                              <div className="rounded-lg border border-amber-300/15 bg-black/40 px-2 py-2">Bouclier {profile.maxShield}</div>
                              <div className="rounded-lg border border-amber-300/15 bg-black/40 px-2 py-2">Attaque {profile.attack}</div>
                              <div className="rounded-lg border border-amber-300/15 bg-black/40 px-2 py-2">Evasion {profile.evasion}</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {hangarUnlocked && (
            <section className="mt-8 rounded-2xl border border-amber-300/20 bg-black/40 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60">Equipes adverses</p>
                <span className="text-[9px] uppercase tracking-[0.4em] text-amber-300">Zone 01</span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {SPACE_ENEMIES.map((enemy) => (
                  <div key={enemy.id} className="rounded-lg border border-amber-300/20 bg-black/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg">{enemy.icon}</p>
                        <p className="text-sm text-amber-100 font-semibold">{enemy.name}</p>
                      </div>
                      <span className="rounded-full border border-red-300/30 bg-red-500/10 px-2 py-1 text-[9px] uppercase tracking-[0.3em] text-red-100">
                        {enemy.threat}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-amber-200/65">{enemy.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] uppercase tracking-[0.22em] text-amber-200/70">
                      <div className="rounded-lg border border-amber-300/15 bg-black/40 px-2 py-2">Coque {enemy.hull}</div>
                      <div className="rounded-lg border border-amber-300/15 bg-black/40 px-2 py-2">Bouclier {enemy.shield}</div>
                      <div className="rounded-lg border border-amber-300/15 bg-black/40 px-2 py-2">+{enemy.rewardCredits} cr</div>
                      <div className="rounded-lg border border-amber-300/15 bg-black/40 px-2 py-2">+{enemy.rewardXp} XP</div>
                    </div>
                    <button
                      onClick={() => startBattle(enemy.id)}
                      disabled={!equippedShipId}
                      className={`mt-3 w-full rounded-lg border px-3 py-1 text-[9px] uppercase tracking-[0.3em] transition ${
                        equippedShipId
                          ? 'border-amber-300/40 bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
                          : 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      Attaquer
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {battle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-amber-300/40 bg-[#0b0f14]/95 backdrop-blur-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(251,191,36,0.3)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black uppercase text-amber-100">Combat — {battle.enemyName}</h2>
                <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-amber-200/60">
                  {battle.shipName} • menace {battle.enemyThreat}
                </p>
              </div>
              <button
                onClick={closeBattle}
                className="text-amber-300/60 hover:text-amber-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="rounded-lg border border-emerald-300/30 bg-black/50 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200/60">Votre vaisseau</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-100">Vie</span>
                    <span className="text-sm font-bold text-emerald-200">{battle.player.hull}/{battle.player.maxHull}</span>
                  </div>
                  <div className="h-2 rounded-full border border-emerald-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-400 to-lime-300 transition-all duration-500"
                      style={{ width: `${(battle.player.hull / battle.player.maxHull) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cyan-100">Bouclier</span>
                    <span className="text-sm font-bold text-cyan-200">{battle.player.shield}/{battle.player.maxShield}</span>
                  </div>
                  <div className="h-2 rounded-full border border-cyan-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-cyan-400 to-sky-300 transition-all duration-500"
                      style={{ width: `${battle.player.maxShield > 0 ? (battle.player.shield / battle.player.maxShield) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-100">Carburant</span>
                    <span className="text-sm font-bold text-amber-200">{battle.player.fuel}/{battle.player.maxFuel}</span>
                  </div>
                  <div className="h-2 rounded-full border border-amber-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-amber-400 to-orange-300 transition-all duration-500"
                      style={{ width: `${(battle.player.fuel / battle.player.maxFuel) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[9px] uppercase tracking-[0.22em] text-emerald-200/75">
                  <div className="rounded-lg border border-white/10 bg-black/40 px-2 py-2">Attaque {battle.player.attack}</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 px-2 py-2">Precision {battle.player.precision}</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 px-2 py-2">Evasion {battle.player.evasion}</div>
                </div>
              </div>

              <div className="rounded-lg border border-red-300/30 bg-black/50 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-red-200/60">Ennemi</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-red-100">Vie</span>
                    <span className="text-sm font-bold text-red-200">{battle.enemy.hull}/{battle.enemy.maxHull}</span>
                  </div>
                  <div className="h-2 rounded-full border border-red-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-red-400 to-orange-400 transition-all duration-500"
                      style={{ width: `${(battle.enemy.hull / battle.enemy.maxHull) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-100">Bouclier</span>
                    <span className="text-sm font-bold text-orange-200">{battle.enemy.shield}/{battle.enemy.maxShield}</span>
                  </div>
                  <div className="h-2 rounded-full border border-orange-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-orange-400 to-amber-300 transition-all duration-500"
                      style={{ width: `${battle.enemy.maxShield > 0 ? (battle.enemy.shield / battle.enemy.maxShield) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-100">Carburant</span>
                    <span className="text-sm font-bold text-amber-200">{battle.enemy.fuel}/{battle.enemy.maxFuel}</span>
                  </div>
                  <div className="h-2 rounded-full border border-amber-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                      style={{ width: `${(battle.enemy.fuel / battle.enemy.maxFuel) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[9px] uppercase tracking-[0.22em] text-red-100/75">
                  <div className="rounded-lg border border-white/10 bg-black/40 px-2 py-2">Attaque {battle.enemy.attack}</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 px-2 py-2">Precision {battle.enemy.precision}</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 px-2 py-2">Evasion {battle.enemy.evasion}</div>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-amber-300/20 bg-black/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/60">Lecture tactique</p>
                  <p className="mt-1 text-sm text-amber-100/85">{battle.enemyDescription}</p>
                </div>
                <div className="flex gap-2 text-[9px] uppercase tracking-[0.25em]">
                  <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-amber-100">Tour {battle.turn}</span>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-1 text-cyan-100">
                    Special joueur {battle.player.specialCooldown > 0 ? `CD ${battle.player.specialCooldown}` : 'pret'}
                  </span>
                  <span className="rounded-full border border-red-300/20 bg-red-500/10 px-2 py-1 text-red-100">
                    Special ennemi {battle.enemy.specialCooldown > 0 ? `CD ${battle.enemy.specialCooldown}` : 'pret'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-300/20 bg-black/60 p-4 mb-6 max-h-40 overflow-y-auto">
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/60 mb-3">Journal de combat</p>
              <div className="space-y-2">
                {battle.battleLog.map((log, idx) => (
                  <p key={idx} className="text-sm text-amber-100/80 font-mono">
                    {log}
                  </p>
                ))}
              </div>
            </div>

            {battle.active ? (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                <button
                  onClick={() => resolveBattle('attack')}
                  disabled={battle.player.fuel < 14}
                  className={`rounded-lg border px-4 py-2 text-[9px] uppercase tracking-[0.3em] font-bold transition ${
                    battle.player.fuel >= 14
                      ? 'border-red-300/40 bg-red-500/10 text-red-100 hover:bg-red-500/20'
                      : 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  ⚔️ Salve (14)
                </button>
                <button
                  onClick={() => resolveBattle('defend')}
                  className="rounded-lg border border-emerald-300/40 bg-emerald-500/10 text-emerald-100 px-4 py-2 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-emerald-500/20 transition"
                >
                  🛡️ Defendre (8)
                </button>
                <button
                  onClick={() => resolveBattle('evade')}
                  className="rounded-lg border border-cyan-300/40 bg-cyan-500/10 text-cyan-100 px-4 py-2 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-cyan-500/20 transition"
                >
                  ⚡ Esquiver (6)
                </button>
                <button
                  onClick={() => resolveBattle('overload')}
                  disabled={battle.player.fuel < battle.player.specialCost || battle.player.specialCooldown > 0}
                  className={`rounded-lg border px-4 py-2 text-[9px] uppercase tracking-[0.3em] font-bold transition ${
                    battle.player.fuel >= battle.player.specialCost && battle.player.specialCooldown === 0
                      ? 'border-amber-300/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
                      : 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  ☄️ {battle.player.specialLabel} ({battle.player.specialCost})
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-bold text-amber-100 mb-4">
                  {battle.winner === 'player' ? '🎉 Victoire' : '💀 Defaite'}
                </p>
                {battle.winner === 'player' && (
                  <p className="mb-4 text-sm text-emerald-200">
                    Recompenses obtenues: +{battle.rewardCredits} credits et +{battle.rewardXp} XP
                  </p>
                )}
                <button
                  onClick={closeBattle}
                  className="rounded-lg border border-amber-300/40 bg-amber-500/10 text-amber-100 px-6 py-2 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-amber-500/20 transition"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
