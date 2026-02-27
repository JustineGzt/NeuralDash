import { useEffect, useMemo, useState } from 'react';
import { TopHeader } from '../components/TopHeader';
import { useMissions } from '../hooks/useMissions';
import { useInventory } from '../hooks/useInventory';

type Action = 'attack' | 'defend' | 'evade';

type BattleState = {
  active: boolean;
  enemyName: string;
  playerHp: number;
  playerMaxHp: number;
  playerFuel: number;
  playerMaxFuel: number;
  enemyHp: number;
  enemyMaxHp: number;
  currentAction: Action | null;
  enemyAction: Action | null;
  battleLog: string[];
  turn: number;
};

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
  const { quests, completeMission } = useMissions();
  const { inventory } = useInventory();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [objectives, setObjectives] = useState(INITIAL_OBJECTIVES);
  const [equippedShipId, setEquippedShipId] = useState<string | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);

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

  useEffect(() => {
    const stored = localStorage.getItem('equippedShip');
    if (stored) {
      Promise.resolve().then(() => {
        setEquippedShipId(stored);
      });
    }
  }, []);

  useEffect(() => {
    if (!equippedShipId) return;
    const stillOwned = shipInventory.some((ship) => ship.id === equippedShipId);
    if (!stillOwned) {
      Promise.resolve().then(() => {
        setEquippedShipId(null);
        localStorage.removeItem('equippedShip');
      });
    }
  }, [equippedShipId, shipInventory]);

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
    localStorage.setItem('equippedShip', shipId);
    setSuccessMessage('Vaisseau equipe.');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const startBattle = (team: string) => {
    if (!equippedShipId) return;
    setBattle({
      active: true,
      enemyName: team,
      playerHp: 100,
      playerMaxHp: 100,
      playerFuel: 100,
      playerMaxFuel: 100,
      enemyHp: 80,
      enemyMaxHp: 80,
      currentAction: null,
      enemyAction: null,
      battleLog: [`Combat contre ${team} commence!`],
      turn: 0
    });
  };

  const resolveBattle = (playerAction: Action) => {
    if (!battle) return;

    const enemyAction: Action = ['attack', 'defend', 'evade'][Math.floor(Math.random() * 3)] as Action;
    const newLog = [...battle.battleLog];
    let playerDamage = 0;
    let enemyDamage = 0;

    // Joueur attaque
    if (playerAction === 'attack') {
      if (battle.playerFuel < 15) {
        newLog.push('❌ Carburant insuffisant pour attaquer!');
      } else {
        playerDamage = enemyAction === 'defend' ? 12 : enemyAction === 'evade' ? 0 : 25;
        if (playerDamage > 0) newLog.push(`🎯 Attaque! ${playerDamage} degats.`);
        else newLog.push('⚠️ Ennemi esquive!');
      }
    } else if (playerAction === 'defend') {
      newLog.push('🛡️ Defense activee.');
    } else {
      newLog.push('⚡ Esquive tentee.');
    }

    // Ennemi attaque
    if (enemyAction === 'attack') {
      const baseEnemyDmg = 20;
      if (playerAction === 'defend') enemyDamage = Math.floor(baseEnemyDmg * 0.5);
      else if (playerAction === 'evade') enemyDamage = Math.random() > 0.4 ? 0 : baseEnemyDmg;
      else enemyDamage = baseEnemyDmg;
      if (enemyDamage > 0) newLog.push(`⚔️ Ennemi attaque! ${enemyDamage} degats.`);
      else newLog.push('✓ Esquive reussie!');
    } else if (enemyAction === 'defend') {
      newLog.push('🛡️ Ennemi se defend.');
    } else {
      newLog.push('⚡ Ennemi esquive.');
    }

    const playerFuelCost = playerAction === 'attack' ? 15 : 8;
    const newPlayerHp = Math.max(0, battle.playerHp - enemyDamage);
    const newPlayerFuel = Math.max(0, battle.playerFuel - playerFuelCost);
    const newEnemyHp = Math.max(0, battle.enemyHp - playerDamage);

    const battleOver = newPlayerHp === 0 || newEnemyHp === 0;
    if (battleOver) {
      if (newEnemyHp === 0) {
        newLog.push('🎉 Victoire!');
        setSuccessMessage('Combat gagne!');
        setTimeout(() => setSuccessMessage(null), 2500);
      } else {
        newLog.push('💀 Defaite...');
        setErrorMessage('Combat perdu.');
        setTimeout(() => setErrorMessage(null), 2500);
      }
    }

    setBattle({
      ...battle,
      playerHp: newPlayerHp,
      playerFuel: newPlayerFuel,
      enemyHp: newEnemyHp,
      currentAction: playerAction,
      enemyAction,
      battleLog: newLog,
      turn: battle.turn + 1,
      active: !battleOver
    });
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
                  <p className="text-[10px] uppercase tracking-[0.45em] text-amber-200/70">Mission en cours</p>
                  <h1 className="mt-2 text-2xl md:text-3xl font-black uppercase text-amber-100">Operation Sables Or</h1>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-amber-200/70">Energie</p>
                  <p className="text-lg font-semibold text-amber-200">74%</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {STAGES.map((stage) => (
                  <div key={stage.id} className="rounded-xl border border-amber-300/20 bg-black/40 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/60">{stage.title}</p>
                    <p className="mt-2 text-sm font-semibold text-amber-100">{stage.status}</p>
                    <div className="mt-3 h-2 rounded-full border border-amber-300/20 bg-black/60 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-amber-300 via-orange-300 to-emerald-300"
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.25em] text-amber-200/50">{stage.progress}%</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-amber-300/20 bg-black/50 p-5">
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60">Objectifs immediats</p>
                <div className="mt-4 space-y-3">
                  {objectives.length === 0 ? (
                    <p className="text-sm text-amber-200/60">Tous les objectifs sont completes.</p>
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
                              <p className="text-[9px] uppercase tracking-[0.35em] text-amber-200/50">Objets requis</p>
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
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60">Equipe active</p>
                <div className="mt-4 space-y-3">
                  {CREW.map((member) => (
                    <div key={member.id} className="rounded-lg border border-amber-300/15 bg-black/40 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-amber-100">{member.name}</span>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-amber-300/80">{member.role}</span>
                      </div>
                      <p className="mt-1 text-[10px] text-amber-200/60 uppercase tracking-[0.25em]">{member.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-amber-300/20 bg-black/40 p-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60">Anomalies detectees</p>
              <span className="text-[9px] uppercase tracking-[0.4em] text-amber-300">Niveau 2</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {['Echo breche', 'Flux instable', 'Signal parasite'].map((label) => (
                <div key={label} className="rounded-lg border border-amber-300/20 bg-black/60 p-4">
                  <p className="text-sm text-amber-100 font-semibold">{label}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-amber-200/60">Analyse en attente</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-amber-300/20 bg-black/50 p-6">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60">Missions neurales</p>
              <span className="text-[9px] uppercase tracking-[0.4em] text-amber-300">
                {adventureMissions.length} trouvees
              </span>
            </div>

            {adventureMissions.length === 0 ? (
              <p className="mt-4 text-sm text-amber-200/60">Aucune mission chargee pour l'aventure.</p>
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
                      <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-amber-200/70">
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
                {['Escouade Orion', 'Garde Nebula', 'Fregate Vesper'].map((team) => (
                  <div key={team} className="rounded-lg border border-amber-300/20 bg-black/60 p-4">
                    <p className="text-sm text-amber-100 font-semibold">{team}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-amber-200/60">Menace moderee</p>
                    <button
                      onClick={() => startBattle(team)}
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
              <h2 className="text-xl font-black uppercase text-amber-100">Combat — {battle.enemyName}</h2>
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
                    <span className="text-sm font-bold text-emerald-200">{battle.playerHp}/{battle.playerMaxHp}</span>
                  </div>
                  <div className="h-2 rounded-full border border-emerald-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-emerald-400 to-lime-300 transition-all duration-500"
                      style={{ width: `${(battle.playerHp / battle.playerMaxHp) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-amber-100">Carburant</span>
                    <span className="text-sm font-bold text-amber-200">{battle.playerFuel}/{battle.playerMaxFuel}</span>
                  </div>
                  <div className="h-2 rounded-full border border-amber-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-amber-400 to-orange-300 transition-all duration-500"
                      style={{ width: `${(battle.playerFuel / battle.playerMaxFuel) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-red-300/30 bg-black/50 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-red-200/60">Ennemi</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-red-100">Vie</span>
                    <span className="text-sm font-bold text-red-200">{battle.enemyHp}/{battle.enemyMaxHp}</span>
                  </div>
                  <div className="h-2 rounded-full border border-red-300/30 bg-black/60 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-red-400 to-orange-400 transition-all duration-500"
                      style={{ width: `${(battle.enemyHp / battle.enemyMaxHp) * 100}%` }}
                    />
                  </div>
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
              <div className="grid gap-3 grid-cols-3">
                <button
                  onClick={() => resolveBattle('attack')}
                  disabled={battle.playerFuel < 15}
                  className={`rounded-lg border px-4 py-2 text-[9px] uppercase tracking-[0.3em] font-bold transition ${
                    battle.playerFuel >= 15
                      ? 'border-red-300/40 bg-red-500/10 text-red-100 hover:bg-red-500/20'
                      : 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  ⚔️ Attaquer (15)
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
                  ⚡ Esquiver (8)
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-bold text-amber-100 mb-4">
                  {battle.playerHp === 0 ? '💀 Defaite' : '🎉 Victoire'}
                </p>
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
