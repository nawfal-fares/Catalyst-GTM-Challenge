import Link from "next/link";
import { ArrowUpRight, CircleDotDashed, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/strategist", label: "Strategist" },
  { href: "/client", label: "Client view" },
];

export function CatalystMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-full bg-lime-300 text-black">
        <CircleDotDashed className="size-4" strokeWidth={2.4} />
      </span>
      <div>
        <div className="text-sm font-semibold tracking-tight">Catalyst</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Signal room</div>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  active,
  modeLabel,
}: {
  children: React.ReactNode;
  active: "strategist" | "client";
  modeLabel: string;
}) {
  return (
    <div className="min-h-screen bg-[#f6f6f1]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f6f1]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/strategist" aria-label="Catalyst home">
            <CatalystMark />
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/70 p-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-medium transition-colors",
                  active === (link.href.slice(1) as typeof active)
                    ? "bg-black text-white"
                    : "text-muted-foreground hover:text-black",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">
              {modeLabel}
            </span>
            <Button
              render={<a href="https://www.gotcatalyst.com/" target="_blank" rel="noreferrer" />}
              size="sm"
              className="rounded-full"
            >
              Catalyst <ArrowUpRight className="size-3.5" />
            </Button>
          </div>
          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" size="icon" className="rounded-full sm:hidden" />}
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle><CatalystMark /></SheetTitle>
                <SheetDescription>GTM content intelligence</SheetDescription>
              </SheetHeader>
              <div className="grid gap-2 px-4">
                {links.map((link) => (
                  <Button key={link.href} render={<Link href={link.href} />} variant="ghost" className="justify-start">
                    {link.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
