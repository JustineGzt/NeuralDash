import { useState } from 'react';
import { MissionRow } from '../components/MissionRow';
import { CreateQuestForm } from '../components/CreateQuestForm';
import { useMissions } from '../hooks/useMissions';

type FilterType = 'all' | 'real' | 'neural' | 'personal' | 'needs';

export const Missions = () => {
  const { quests, loading, error, completeMission, togglePin, createQuest, seedMissions } = useMissions();
  const [seeding, setSeeding] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasNeedsBoost = (quest: (typeof quests)[number]) =>
    Boolean(quest.isNeedsMission || (quest.needsEffects && Object.keys(quest.needsEffects).length > 0));

  const formatNeedsBoost = (quest: (typeof quests)[number]) => {
    if (!quest.needsEffects) return '';

    const labels: Record<string, string> = {
      hunger: 'Faim',
      thirst: 'Soif',
      engagement: 'Anti-ennui',
      productivity: 'Productivité',
      energy: 'Énergie',
      focus: 'Focus',
      mood: 'Moral',
    };

    return Object.entries(quest.needsEffects)
      .filter(([, value]) => typeof value === 'number' && value > 0)
      .slice(0, 3)
      .map(([key, value]) => `+${value} ${labels[key] ?? key}`)
      .join(' · ');
  };

  const handleSeedMissions = async () => {
    setSeeding(true);
    try {
      await seedMissions();
      setSuccessMessage('✅ Missions synchronisées!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setSeeding(false);
    }
  };

  const handleCompleteMission = async (questId: string) => {
    setErrorMessage(null);
    try {
      const quest = quests.find((q) => q.id === questId);
      const result = await completeMission(questId);
      if (result.reward || quest) {
        const rewardPart = result.reward ? `+${result.reward.name}` : 'progression enregistrée';
        const needsPart = quest ? formatNeedsBoost(quest) : '';
        setSuccessMessage(
          needsPart
            ? `🎉 Mission complétée! ${rewardPart} | Besoins: ${needsPart}`
            : `🎉 Mission complétée! ${rewardPart}`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage(msg);
      console.error('Failed to complete mission:', err);
    }
  };

  // Filtrer les missions
  const filteredQuests = quests.filter((quest) => {
    if (filter === 'needs') return hasNeedsBoost(quest);
    if (filter === 'personal') return quest.missionType === 'personal' || quest.isUserCreated === true;
    if (filter === 'real') return quest.missionType === 'real';
    if (filter === 'neural') return quest.missionType === 'neural';
    return true;
  });

  // Calculer les stats
  const availableQuests = quests.filter((q) => !q.completed).length;
  const completedQuests = quests.filter((q) => q.completed).length;
  const completedRealQuests = quests.filter((q) => q.completed && q.missionType === 'real').length;
  const completedNeuralQuests = quests.filter((q) => q.completed && q.missionType === 'neural').length;
  const completedPersonalQuests = quests.filter((q) => q.completed && (q.missionType === 'personal' || q.isUserCreated)).length;
  const personalQuests = quests.filter((q) => q.missionType === 'personal' || q.isUserCreated).length;
  const needsQuests = quests.filter((q) => hasNeedsBoost(q)).length;

  return (
    <div className="min-h-screen bg-[#120015] text-fuchsia-100 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl">
        <div className="absolute -inset-8 bg-[radial-gradient(circle_at_top,rgba(232,121,249,0.2),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(232,121,249,0.35) 1px, transparent 1px), linear-gradient(rgba(232,121,249,0.35) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative z-10 border border-fuchsia-300/50 rounded-3xl bg-fuchsia-950/60 backdrop-blur-2xl p-6 md:p-10 shadow-[0_0_40px_rgba(52,0,60,0.9)]">
          {/* Header */}
          <header className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-fuchsia-200/70">
            <span className="h-2 w-2 rounded-full bg-fuchsia-300" />
            <span>🎯 Défis & Objectifs</span>
            <button className="text-fuchsia-300/80 text-lg hover:text-fuchsia-200">×</button>
          </header>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/40 rounded text-sm text-green-200 animate-in fade-in">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-lg border border-fuchsia-300/30 bg-fuchsia-500/10 p-3 text-center">
              <p className="text-[9px] text-fuchsia-200/60 uppercase tracking-widest">Disponibles</p>
              <p className="text-2xl font-black text-fuchsia-300 mt-1">{availableQuests}</p>
            </div>
            <div className="rounded-lg border border-fuchsia-300/30 bg-fuchsia-500/10 p-3 text-center">
              <p className="text-[9px] text-fuchsia-200/60 uppercase tracking-widest">Complétées</p>
              <p className="text-2xl font-black text-green-400 mt-1">{completedQuests}</p>
            </div>
            <div className="rounded-lg border border-green-400/30 bg-green-500/10 p-3 text-center">
              <p className="text-[9px] text-green-200/60 uppercase tracking-widest">Réelles ✓</p>
              <p className="text-2xl font-black text-green-300 mt-1">{completedRealQuests}</p>
            </div>
            <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-3 text-center">
              <p className="text-[9px] text-cyan-200/60 uppercase tracking-widest">Neuronales ✓</p>
              <p className="text-2xl font-black text-cyan-300 mt-1">{completedNeuralQuests}</p>
            </div>
            <div className="rounded-lg border border-violet-400/30 bg-violet-500/10 p-3 text-center">
              <p className="text-[9px] text-violet-200/60 uppercase tracking-widest">Personnel ✓</p>
              <p className="text-2xl font-black text-violet-300 mt-1">{completedPersonalQuests}</p>
            </div>
          </div>

          {/* Erreur API */}
          {error && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded text-sm text-yellow-200">
              ⚠️ En mode offline - Les récompenses sont conservées localement
            </div>
          )}

          {/* Create Form */}
          <div className="mt-6">
            <CreateQuestForm onCreate={createQuest} />
          </div>

          {/* Missions List */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-fuchsia-200/70">
                <span className="h-2 w-2 rounded-full bg-fuchsia-300" />
                <span>Missions ({filteredQuests.length})</span>
              </div>
              {error && (
                <button
                  onClick={handleSeedMissions}
                  disabled={seeding}
                  className="text-[9px] px-3 py-1 rounded border border-fuchsia-400/50 text-fuchsia-300 hover:bg-fuchsia-500/20 disabled:opacity-50"
                >
                  {seeding ? '⏳ Sync...' : '🔄 Sync API'}
                </button>
              )}
            </div>

            {/* Filtres */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`text-[9px] px-3 py-1 rounded border transition-all uppercase tracking-widest ${
                  filter === 'all'
                    ? 'border-fuchsia-300 bg-fuchsia-400/30 text-fuchsia-100'
                    : 'border-fuchsia-300/50 text-fuchsia-100/60 hover:bg-fuchsia-400/20'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('real')}
                className={`text-[9px] px-3 py-1 rounded border transition-all uppercase tracking-widest ${
                  filter === 'real'
                    ? 'border-green-400 bg-green-500/30 text-green-100'
                    : 'border-green-400/50 text-green-100/60 hover:bg-green-500/20'
                }`}
              >
                🌍 Réelles
              </button>
              <button
                onClick={() => setFilter('neural')}
                className={`text-[9px] px-3 py-1 rounded border transition-all uppercase tracking-widest ${
                  filter === 'neural'
                    ? 'border-cyan-400 bg-cyan-500/30 text-cyan-100'
                    : 'border-cyan-400/50 text-cyan-100/60 hover:bg-cyan-500/20'
                }`}
              >
                ⚡ Neuronales
              </button>
              <button
                onClick={() => setFilter('personal')}
                className={`text-[9px] px-3 py-1 rounded border transition-all uppercase tracking-widest ${
                  filter === 'personal'
                    ? 'border-violet-300 bg-violet-500/30 text-violet-100'
                    : 'border-violet-300/50 text-violet-100/60 hover:bg-violet-500/20'
                }`}
              >
                👤 Personnel ({personalQuests})
              </button>
              <button
                onClick={() => setFilter('needs')}
                className={`text-[9px] px-3 py-1 rounded border transition-all uppercase tracking-widest ${
                  filter === 'needs'
                    ? 'border-amber-300 bg-amber-500/30 text-amber-100'
                    : 'border-amber-300/50 text-amber-100/70 hover:bg-amber-500/20'
                }`}
              >
                🧪 Besoins ({needsQuests})
              </button>
            </div>

            {loading ? (
              <div className="mt-5 text-center py-8">
                <p className="text-sm text-fuchsia-200/50">⏳ Chargement des missions...</p>
              </div>
            ) : filteredQuests.length === 0 ? (
              <div className="text-center py-8 space-y-4 mt-5">
                <p className="text-sm text-fuchsia-200/50">
                  {filter === 'all'
                    ? 'Aucune mission disponible'
                    : filter === 'real'
                      ? 'Aucune mission réelle'
                      : filter === 'neural'
                        ? 'Aucune mission neuronale'
                        : filter === 'personal'
                          ? 'Aucune mission personnelle'
                          : 'Aucune mission besoins'}
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="text-[9px] px-3 py-1 rounded border border-fuchsia-400/50 text-fuchsia-300 hover:bg-fuchsia-500/20"
                  >
                    Voir toutes les missions
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredQuests.map((quest) => (
                  <MissionRow
                    key={quest.id}
                    quest={quest}
                    onTogglePin={togglePin}
                    onComplete={handleCompleteMission}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
