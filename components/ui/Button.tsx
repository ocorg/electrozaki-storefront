import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps } from "react";

// primary: ink pill (default action) · accent: brass pill (the one main
// action of a screen) · outline: on light surfaces · outline-dark: on ink
// surfaces (a light-surface outline was used on the dark repair hero and
// rendered white text on a white fill) · whatsapp: WhatsApp's own green,
// with ink text (white on #25D366 is only 1.98:1).
export type ButtonVariant = "primary" | "accent" | "outline" | "outline-dark" | "ghost" | "whatsapp";
export type ButtonSize = "md" | "sm" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-ink-foreground hover:bg-ink-3 shadow-[0_8px_20px_-10px_rgb(17_16_19/0.6)]",
  accent:
    "bg-gold text-gold-foreground hover:bg-gold-bright shadow-[0_10px_24px_-12px_rgb(200_146_42/0.9)] hover:shadow-[0_14px_30px_-12px_rgb(200_146_42/0.9)]",
  outline: "border border-ink/15 bg-white text-neutral-900 hover:border-ink/40",
  "outline-dark": "on-dark border border-white/25 bg-white/5 text-white hover:border-gold hover:bg-white/10",
  ghost: "text-neutral-600 underline underline-offset-4 hover:text-ink",
  whatsapp: "bg-whatsapp text-ink hover:brightness-105 shadow-[0_10px_24px_-12px_rgb(37_211_102/0.9)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-6 text-[15px]",
  lg: "min-h-14 px-8 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,box-shadow,transform,border-color,filter] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none";

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
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
