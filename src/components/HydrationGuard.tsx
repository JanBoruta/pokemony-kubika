"use client";

import { ReactNode } from "react";
import { useHasHydrated } from "@/store/collectionStore";

interface HydrationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * HydrationGuard ensures children are only rendered after Zustand store
 * has been rehydrated from localStorage.
 *
 * This prevents SSR/client hydration mismatches by showing a loading state
 * until the client-side state is ready.
 */
export default function HydrationGuard({ children, fallback }: HydrationGuardProps) {
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) {
    // Show loading state during SSR and initial hydration
    return (
      <>
        {fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0f0f23]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FFCB05] border-t-transparent mx-auto mb-4"></div>
              <p className="text-[#FFCB05] text-lg font-medium">Nacitam...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
