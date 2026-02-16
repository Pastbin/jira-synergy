"use client";

import { SessionProvider } from "next-auth/react";
import StyledComponentsRegistry from "@/lib/registry";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
    </SessionProvider>
  );
}
