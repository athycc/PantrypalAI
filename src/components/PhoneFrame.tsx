import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-secondary flex items-center justify-center md:p-6">
      <div className="relative w-full max-w-[420px] min-h-screen md:min-h-[860px] md:max-h-[920px] md:rounded-[2.5rem] bg-background overflow-hidden md:shadow-glow md:border md:border-border flex flex-col">
        {children}
      </div>
    </div>
  );
}
