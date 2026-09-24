import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-mint)] hover:-translate-y-0.5 hover:bg-primary/90",
        glass:
          "border border-glass-border bg-glass text-foreground backdrop-blur-xl hover:-translate-y-0.5 hover:bg-glass-strong",
        ghost: "text-muted-foreground hover:bg-glass hover:text-foreground",
        icon: "size-11 border border-glass-border bg-glass p-0 text-muted-foreground backdrop-blur-xl hover:text-foreground",
      },
      size: {
        default: "min-h-11 px-5",
        small: "min-h-9 px-3 text-xs",
        large: "min-h-12 px-6",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}