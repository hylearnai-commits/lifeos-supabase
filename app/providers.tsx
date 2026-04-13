"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useIsSSR } from "@react-aria/ssr";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isSSR = useIsSSR();

  if (isSSR) {
    return <>{children}</>;
  }

  return (
    <NextUIProvider navigate={router.push}>
      {children}
    </NextUIProvider>
  );
}
