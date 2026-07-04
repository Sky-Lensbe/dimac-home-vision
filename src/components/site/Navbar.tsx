import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/diensten", label: "Diensten" },
  { to: "/werkwijze", label: "Werkwijze" },
  { to: "/realisaties", label: "Realisaties" },
  { to: "/woningscan", label: "Woningscan" },
  { to: "/over", label: "Over Dimac" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled || open
          ? "bg-background/85 backdrop-blur-md border-b border-border/60"
          : "bg-transparent"
      )}
    >
      <div className="container-wide flex h-20 items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2 group">
          <span className="font-display text-2xl tracking-tight text-primary">Dimac</span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">BV</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV.map((item) => (
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
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild variant="solid" size="sm">
            <Link to="/contact">Gesprek aanvragen</Link>
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
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="container-wide py-6 flex flex-col gap-1">
            {NAV.map((item) => (
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
            ))}
            <Button asChild variant="solid" className="mt-6 w-full">
              <Link to="/contact">Gesprek aanvragen</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
