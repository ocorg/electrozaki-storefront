import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps } from "react";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "md" | "sm";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-ink-foreground hover:bg-neutral-800",
  accent: "bg-gold text-gold-foreground hover:brightness-95",
  outline: "border border-black/15 bg-white text-neutral-800 hover:border-gold hover:text-ink",
  ghost: "text-neutral-500 underline underline-offset-2 hover:text-ink shadow-none hover:shadow-none",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-sm",
  sm: "min-h-9 px-3.5 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:active:scale-100";

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = ""
) {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function LinkButton({ variant = "primary", size = "md", className, ...props }: LinkButtonProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

type AnchorButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function AnchorButton({ variant = "primary", size = "md", className, ...props }: AnchorButtonProps) {
  return <a className={buttonClasses(variant, size, className)} {...props} />;
}
