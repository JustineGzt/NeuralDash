/**
 * Utilitaire withSuspense - Ne pas mélanger avec les composants
 */

import type { ComponentType } from 'react';
import { PageSkeleton } from './suspenseWrapper';
import { Suspense } from 'react';

/**
 * Wrap un lazy-loaded component avec Suspense boundary
 */
export function withSuspense(Component: ComponentType<Record<string, unknown>>) {
  return (props: Record<string, unknown>) => (
    <Suspense fallback={<PageSkeleton />}>
      <Component {...props} />
    </Suspense>
  );
}
