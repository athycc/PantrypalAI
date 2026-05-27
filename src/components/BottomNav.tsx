import { Link } from "@tanstack/react-router";
import { Package, ScanLine, UtensilsCrossed, Wallet, ShoppingBag } from "lucide-react";

const items = [
  { to: "/" as const, label: "Pantry", Icon: Package },
  { to: "/scanner" as const, label: "Scanner", Icon: ScanLine },
  { to: "/meals" as const, label: "Meals", Icon: UtensilsCrossed },
  { to: "/shopping" as const, label: "List", Icon: ShoppingBag },
  { to: "/budget" as const, label: "Budget", Icon: Wallet },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 mt-auto border-t border-border bg-[var(--color-nav)]/95 backdrop-blur">
      <ul className="flex items-center justify-around px-2 pb-3 pt-2.5">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="group flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <span className="h-0.5 w-6 rounded-full bg-transparent group-data-[status=active]:bg-primary" />
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
