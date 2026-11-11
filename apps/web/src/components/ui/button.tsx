import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      primary: "button--primary",
      secondary: "button--secondary",
      ghost: "button--ghost",
      danger: "button--danger",
    },
    size: {
      sm: "button--sm",
      md: "button--md",
      lg: "button--lg",
    },
    block: { true: "button--block" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> &
  Readonly<{ asChild?: boolean }>;

export function Button({ asChild = false, block, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ block, size, variant }), className)} {...props} />;
}
