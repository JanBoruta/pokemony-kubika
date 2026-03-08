"use client";

import { useEffect, useState } from "react";
import { useCollectionStore } from "@/store/collectionStore";

interface StoreHydrationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function StoreHydrationGuard({
  children,
  fallback
}: StoreHydrationGuardProps) {
  const [isClient, setIsClient] = useState(false);
  const hasHydrated = useCollectionStore((state) => state.hasHydrated);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Počkej na klienta a hydrataci store
  if (!isClient || !hasHydrated) {
    return fallback ?? (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f23]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFCB05] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Načítání...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
