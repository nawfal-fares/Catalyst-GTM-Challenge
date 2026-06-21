import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
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
    <div className="flex items-center gap-3">
      <span className="grid size-8 place-items-center bg-[#caff54] font-mono text-xs font-bold text-[#17201f]">
        C/
      </span>
      <div className="leading-none">
        <div className="font-serif text-lg tracking-[-0.02em]">Catalyst</div>
        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-black/45">
          Market intelligence
        </div>
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
    <div className="min-h-screen bg-[#f2f0e9]">
      <header className="sticky top-0 z-50 border-b border-black/12 bg-[#f2f0e9]/94 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/strategist" aria-label="Catalyst home">
            <CatalystMark />
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b py-2 text-xs font-medium transition-colors",
                  active === (link.href.slice(1) as typeof active)
                    ? "border-black text-black"
                    : "border-transparent text-black/45 hover:text-black",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-black/45">
              {modeLabel}
            </span>
            <Button
              render={<a href="https://www.gotcatalyst.com/" target="_blank" rel="noreferrer" />}
              size="sm"
              variant="outline"
              className="h-8 rounded-none border-black/20 bg-transparent px-3 text-[10px]"
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
                <SheetDescription>Market learning from executive content</SheetDescription>
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
