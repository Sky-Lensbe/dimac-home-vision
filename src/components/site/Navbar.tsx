import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { services } from "@/data/services";
import { track } from "@/lib/analytics";
import logoAsset from "@/assets/dimac-logo.jpg.asset.json";

const NAV: { to: string; label: string; children?: { to: string; label: string }[] }[] = [
  { to: "/", label: "Home" },
  {
    to: "/diensten",
    label: "Diensten",
    children: services.map((s) => ({ to: `/diensten/${s.slug}`, label: s.navLabel })),
  },
  { to: "/woningscan", label: "Woningscan" },
  { to: "/realisaties", label: "Realisaties" },
  { to: "/werkwijze", label: "Werkwijze" },
  { to: "/over", label: "Over Dimac" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dienstenOpen, setDienstenOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const { pathname } = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileSubmenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Gesloten menu's volledig uit de focusvolgorde halen.
  useEffect(() => {
    const el = mobileMenuRef.current;
    if (el) el.inert = !open;
  }, [open]);

  useEffect(() => {
    const el = mobileSubmenuRef.current;
    if (el) el.inert = !(open && mobileServices);
  }, [open, mobileServices]);

  useEffect(() => {
    setOpen(false);
    setMobileServices(false);
    setDienstenOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 bg-background transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        scrolled || open
          ? "border-b border-border shadow-soft bg-background/95 supports-[backdrop-filter]:backdrop-blur-[2px]"
          : "border-b border-transparent shadow-none"
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between">
        <Link
          to="/"
          className="focus-ring flex items-center gap-3 group/logo"
          aria-label="Dimac — home"
        >
          <img
            src={logoAsset.url}
            alt="Dimac"
            className="h-11 w-11 rounded-md object-cover transition-opacity duration-300 fine:group-hover/logo:opacity-85"
            width={44}
            height={44}
          />
          <span className="font-display text-lg text-primary hidden sm:inline transition-colors duration-300 fine:lg:group-hover/logo:text-accent">
            Dimac
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((item) =>
            item.children ? (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => setDienstenOpen(true)}
                onMouseLeave={() => setDienstenOpen(false)}
                onFocus={() => setDienstenOpen(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDienstenOpen(false);
                }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "focus-ring flex items-center gap-1 text-[13px] tracking-wide py-2 transition-colors duration-300 link-underline",
                      isActive ? "text-accent" : "text-primary/80 fine:hover:text-primary"
                    )
                  }
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform duration-300 ease-out motion-reduce:transition-none",
                      dienstenOpen && "rotate-180"
                    )}
                  />
                </NavLink>
                {/* pt-3 vormt de hoverbrug tussen trigger en menu */}
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-[opacity,transform] duration-200 ease-out",
                    dienstenOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-1 pointer-events-none"
                  )}
                >
                  <div className="w-64 max-w-[calc(100vw-3rem)] bg-background border border-border shadow-elevated py-2">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        className={({ isActive }) =>
                          cn(
                            "focus-ring-inset block px-5 py-2.5 text-[13px] border-l-2 transition-[color,background-color,border-color,padding] duration-300 ease-out",
                            isActive
                              ? "text-accent bg-surface border-accent"
                              : "text-primary/80 border-transparent fine:hover:text-accent fine:hover:bg-surface/70 fine:hover:border-accent/60 fine:hover:pl-6"
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
                    "focus-ring text-[13px] tracking-wide link-underline transition-colors duration-300",
                    isActive ? "text-accent" : "text-primary/80 fine:hover:text-primary"
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
            <Link
              to="/contact"
              onClick={() =>
                track("navigation_cta_click", { page_type: "navigatie", cta_label: "Bespreek je project" })
              }
            >
              Bespreek je project
            </Link>
          </Button>
        </div>

        <button
          className="focus-ring lg:hidden p-2 -mr-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-primary transition-colors duration-200 active:bg-surface-strong"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        aria-hidden={!open}
        className={cn(
          "lg:hidden overflow-hidden bg-background transition-[max-height,opacity] duration-300 ease-out",
          open
            ? "max-h-[80vh] opacity-100 overflow-y-auto border-t border-border/60"
            : "max-h-0 opacity-0 pointer-events-none border-t border-transparent"
        )}
      >
        <div className="container-wide py-6 flex flex-col">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.to} className="border-b border-border/40">
                <button
                  className="focus-ring w-full flex items-center justify-between py-3 min-h-[44px] text-base text-primary transition-colors duration-200 active:text-accent"
                  onClick={() => setMobileServices((v) => !v)}
                  aria-expanded={mobileServices}
                  aria-controls="mobile-submenu-diensten"
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-300 ease-out motion-reduce:transition-none",
                      mobileServices && "rotate-180"
                    )}
                  />
                </button>
                <div
                  ref={mobileSubmenuRef}
                  id="mobile-submenu-diensten"
                  aria-hidden={!(open && mobileServices)}
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    mobileServices ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden pl-4 flex flex-col">
                    <NavLink to={item.to} className="focus-ring text-sm text-accent py-3 min-h-[44px] flex items-center">
                      Alle diensten →
                    </NavLink>
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        className="focus-ring text-sm text-primary/80 py-3 min-h-[44px] flex items-center transition-colors duration-200 active:text-accent"
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
                    "focus-ring py-3 min-h-[44px] flex items-center text-base border-b border-border/40 transition-colors duration-200 active:text-accent",
                    isActive ? "text-accent" : "text-primary"
                  )
                }
              >
                {item.label}
              </NavLink>
            )
          )}
          <Button asChild variant="solid" className="mt-6 w-full">
            <Link
              to="/contact"
              onClick={() =>
                track("navigation_cta_click", { page_type: "navigatie", cta_label: "Bespreek je project" })
              }
            >
              Bespreek je project
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
