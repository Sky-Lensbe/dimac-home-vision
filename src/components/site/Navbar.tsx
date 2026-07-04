import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { services } from "@/data/services";

const NAV: { to: string; label: string; children?: { to: string; label: string }[] }[] = [
  { to: "/", label: "Home" },
  { to: "/woningscan", label: "Woningscan" },
  {
    to: "/diensten",
    label: "Diensten",
    children: services.map((s) => ({ to: `/diensten/${s.slug}`, label: s.navLabel })),
  },
  { to: "/werkwijze", label: "Werkwijze" },
  { to: "/realisaties", label: "Realisaties" },
  { to: "/reviews", label: "Reviews" },
  { to: "/over", label: "Over Dimac" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dienstenOpen, setDienstenOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileServices(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled || open
          ? "bg-background/90 backdrop-blur-md border-b border-border/60"
          : "bg-transparent"
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight text-primary">Dimac</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">BV</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((item) =>
            item.children ? (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setDienstenOpen(true)}
                onMouseLeave={() => setDienstenOpen(false)}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1 text-[13px] tracking-wide py-2 transition-colors",
                      isActive ? "text-accent" : "text-primary/80 hover:text-primary"
                    )
                  }
                >
                  {item.label}
                  <ChevronDown className={cn("w-3 h-3 transition-transform", dienstenOpen && "rotate-180")} />
                </NavLink>
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-200",
                    dienstenOpen ? "opacity-100 visible" : "opacity-0 invisible"
                  )}
                >
                  <div className="w-64 bg-background border border-border shadow-elevated py-2">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        className={({ isActive }) =>
                          cn(
                            "block px-5 py-2.5 text-[13px] transition-colors",
                            isActive
                              ? "text-accent bg-surface"
                              : "text-primary/80 hover:text-accent hover:bg-surface/70"
                          )
                        }
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "text-[13px] tracking-wide link-underline transition-colors",
                    isActive ? "text-accent" : "text-primary/80 hover:text-primary"
                  )
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="hidden lg:block">
          <Button asChild variant="solid" size="sm">
            <Link to="/contact">Offerte aanvragen</Link>
          </Button>
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-primary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background max-h-[80vh] overflow-y-auto">
          <div className="container-wide py-6 flex flex-col">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.to} className="border-b border-border/40">
                  <button
                    className="w-full flex items-center justify-between py-3 text-base text-primary"
                    onClick={() => setMobileServices((v) => !v)}
                  >
                    {item.label}
                    <ChevronDown className={cn("w-4 h-4 transition-transform", mobileServices && "rotate-180")} />
                  </button>
                  {mobileServices && (
                    <div className="pl-4 pb-4 flex flex-col gap-3">
                      <NavLink to={item.to} className="text-sm text-accent">Alle diensten →</NavLink>
                      {item.children.map((c) => (
                        <NavLink key={c.to} to={c.to} className="text-sm text-primary/80">{c.label}</NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "py-3 text-base border-b border-border/40",
                      isActive ? "text-accent" : "text-primary"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
            <Button asChild variant="solid" className="mt-6 w-full">
              <Link to="/contact">Offerte aanvragen</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
