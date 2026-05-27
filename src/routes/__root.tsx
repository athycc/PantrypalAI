import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useLocation, useNavigate,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import appCss from "../style.css?url";
import { ThemeApplier } from "@/components/Theme";
import { useStore } from "@/lib/store";
import { supabase } from "@/integration/supabase/client";
import { startCloudSync, stopCloudSync } from "@/lib/cloud-sync";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "PantryPal AI — Scan, Track, Save" },
      { name: "description", content: "AI-powered pantry, meal & budget companion for Filipino students and dormers." },
      { name: "theme-color", content: "#f7d488" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeApplier />
      <Bootstrap />
      <Outlet />
      <Toaster position="top-center" toastOptions={{ style: { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" } }} />
    </QueryClientProvider>
  );
}

function Bootstrap() {
  const navigate = useNavigate();
  const location = useLocation();
  const onboarded = useStore((s) => s.onboarded);

  // Onboarding redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = location.pathname;
    const skip = path === "/onboarding" || path === "/login";
    if (!onboarded && !skip) navigate({ to: "/onboarding" });
  }, [onboarded, location.pathname, navigate]);

  // Cloud sync on auth state
  useEffect(() => {
    let started = false;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !started) {
        started = true;
        void startCloudSync(data.session.user.id, { mergeLocal: true });
      }
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        void startCloudSync(session.user.id, { mergeLocal: true });
      } else if (event === "SIGNED_OUT") {
        stopCloudSync();
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}
