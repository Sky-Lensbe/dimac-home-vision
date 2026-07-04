import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-hover))]",
        solid:
          "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-hover))]",
        outline:
          "border border-primary/80 text-primary bg-transparent hover:border-accent hover:text-accent",
        ghost:
          "text-primary hover:text-accent",
        link:
          "text-accent underline-offset-4 hover:underline p-0 h-auto",
        accent:
          "bg-accent text-accent-foreground hover:bg-[hsl(var(--accent-hover))]",
        subtle:
          "bg-surface text-primary border border-border hover:border-accent hover:text-accent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "h-12 px-7 rounded-none",
        sm: "h-9 px-4 text-xs rounded-none",
        lg: "h-14 px-9 text-[15px] rounded-none",
        icon: "h-10 w-10 rounded-none",
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
