import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide transition-[background-color,border-color,color,transform,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-300 [&>svg:last-child]:ease-out motion-safe:lg:hover:[&>svg:last-child]:translate-x-1",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-hover))] motion-safe:lg:hover:-translate-y-px hover:shadow-card active:translate-y-0 active:bg-[hsl(var(--accent-hover))] active:shadow-none",
        solid:
          "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-hover))] motion-safe:lg:hover:-translate-y-px hover:shadow-card active:translate-y-0 active:bg-[hsl(var(--accent-hover))] active:shadow-none",
        outline:
          "border border-primary/80 text-primary bg-transparent hover:border-accent hover:text-accent hover:bg-accent-soft active:bg-surface-strong",
        ghost:
          "text-primary hover:text-accent hover:bg-accent-soft active:bg-surface-strong",
        link:
          "text-accent underline-offset-4 hover:underline p-0 h-auto",
        accent:
          "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-hover))] motion-safe:lg:hover:-translate-y-px hover:shadow-card active:translate-y-0 active:shadow-none",
        subtle:
          "bg-surface text-primary border border-border hover:border-accent hover:text-accent active:bg-surface-strong",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-surface-strong",
      },
      size: {
        default: "h-12 px-7 rounded-none",
        sm: "h-9 px-4 text-xs rounded-none",
        lg: "h-14 px-9 text-[15px] rounded-none",
        icon: "h-11 w-11 rounded-none",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
