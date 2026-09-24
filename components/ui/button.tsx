import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

import { cn } from "cn";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// `loading` injects extra children (spinner + sweep), which Radix `Slot`
// can't accept — it needs exactly one child — so the two are exclusive.
type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> &
  (
    | { asChild?: false; loading?: boolean }
    | { asChild: true; loading?: never }
  );

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        data-slot="button"
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({ variant, size, className }),
        // Busy buttons are disabled for input, but stay at full opacity so
        // the sweep reads as "working" rather than "unavailable".
        loading && "relative overflow-hidden disabled:opacity-100"
      )}
      data-slot="button"
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-current/15 to-transparent motion-reduce:hidden"
          />
          <Loader2 aria-hidden className="animate-spin" />
        </>
      )}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
