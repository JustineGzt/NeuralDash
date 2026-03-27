/**
 * Utilitaire pour suspense wrapper - Composant Skeleton
 */

/**
 * Composant de chargement minimal
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#03070b] flex items-center justify-center">
      <div className="space-y-4">
        <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );
}
