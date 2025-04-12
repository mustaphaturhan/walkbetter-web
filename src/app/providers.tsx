import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TRPCReactProvider } from "@/trpc/react";
import type * as React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      {children}
      <ReactQueryDevtools />
    </TRPCReactProvider>
  );
}
