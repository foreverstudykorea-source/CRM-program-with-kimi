import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5 [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary/10 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-card text-muted-foreground",
        success: "border-success/15 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        destructive: "border-destructive/15 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
