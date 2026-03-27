import { useState } from 'react';
import { CATEGORIES, DIFFICULTIES } from '../constants/quest';

type CreateQuestFormProps = {
  onCreate: (title: string, category: string, difficulty: string, description?: string) => Promise<boolean>;
};

export const CreateQuestForm = ({ onCreate }: CreateQuestFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !category || !difficulty || isSubmitting) return;
    
    setIsSubmitting(true);
    const success = await onCreate(title, category, difficulty, description);
    setIsSubmitting(false);
    
    if (success) {
      setTitle('');
      setDescription('');
      setCategory('');
      setDifficulty('');
      setShowSuccess(true);
      
      // Masquer le message après 3 secondes
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <section className="border border-fuchsia-300/40 rounded-2xl p-6 bg-fuchsia-500/10">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-fuchsia-200/80">
        <span className="h-2 w-2 rounded-full bg-fuchsia-300" />
        <span>✨ Créer une nouvelle mission</span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.35em] text-fuchsia-200/70 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Nettoyer la cuisine, Faire 5km, Apprendre React..."
            className="w-full rounded-lg border border-fuchsia-300/50 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-100 placeholder-fuchsia-300/40 focus:border-fuchsia-300 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.35em] text-fuchsia-200/70 mb-2">
            Description (Optionnel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez ce que tu veux accomplir..."
            rows={2}
            className="w-full rounded-lg border border-fuchsia-300/50 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-100 placeholder-fuchsia-300/40 focus:border-fuchsia-300 focus:outline-none resize-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-fuchsia-200/70 mb-3">
              Catégorie
            </p>
            <div className="space-y-2 max-h-50 overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`block w-full px-3 py-2 rounded-lg border text-[10px] uppercase tracking-[0.2em] transition-all text-left ${
                    category === cat.value
                      ? 'border-fuchsia-300 bg-fuchsia-400/30 text-fuchsia-100 shadow-[0_0_12px_rgba(232,121,249,0.4)]'
                      : 'border-fuchsia-300/50 text-fuchsia-100/80 hover:bg-fuchsia-400/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-fuchsia-200/70 mb-3">
              Difficulté
            </p>
            <div className="flex flex-col gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setDifficulty(diff.value)}
                  className={`px-4 py-2 rounded-lg border text-[10px] uppercase tracking-[0.3em] transition-all ${
                    difficulty === diff.value
                      ? 'border-fuchsia-300 bg-fuchsia-400/30 text-fuchsia-100 shadow-[0_0_12px_rgba(232,121,249,0.4)]'
                      : 'border-fuchsia-300/50 text-fuchsia-100/80 hover:bg-fuchsia-400/20'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !category || !difficulty || isSubmitting}
          className="rounded-xl border border-fuchsia-200/60 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-fuchsia-100/90 shadow-[0_0_16px_rgba(232,121,249,0.4)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-fuchsia-400/20 transition-all"
        >
          {isSubmitting ? '⏳ Création...' : '✨ Créer la mission'}
        </button>
        
        {showSuccess && (
          <div className="text-center text-sm text-green-400 animate-pulse">
            ✅ Mission créée avec succès !
          </div>
        )}
      </div>
    </section>
  );
};
