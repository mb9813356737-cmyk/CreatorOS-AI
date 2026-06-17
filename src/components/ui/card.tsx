"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glass-strong" | "glow";
  hoverEffect?: boolean;
  noise?: boolean;
  glow?: boolean;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
}

const glowColorMap = {
  blue: { base: 240, spread: -50 }, // Brand indigo-cyan spotlight
  purple: { base: 270, spread: 40 }, // Violet hover spotlight
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 }
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { 
      className, 
      variant = "glass", 
      hoverEffect = true, 
      noise = false, 
      glow = true,
      glowColor = "blue",
      style,
      children, 
      ...props 
    }, 
    ref
  ) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current!);

    React.useEffect(() => {
      if (!glow) return;

      const syncPointer = (e: PointerEvent) => {
        const { clientX: x, clientY: y } = e;
        const currentCard = internalRef.current;
        if (currentCard) {
          currentCard.style.setProperty("--x", x.toFixed(2));
          currentCard.style.setProperty("--xp", (x / window.innerWidth).toFixed(2));
          currentCard.style.setProperty("--y", y.toFixed(2));
          currentCard.style.setProperty("--yp", (y / window.innerHeight).toFixed(2));
        }
      };

      document.addEventListener("pointermove", syncPointer);
      return () => document.removeEventListener("pointermove", syncPointer);
    }, [glow]);

    const { base, spread } = glowColorMap[glowColor] || glowColorMap.blue;

    const beforeAfterStyles = `
      [data-glow-card]::before,
      [data-glow-card]::after {
        pointer-events: none;
        content: "";
        position: absolute;
        inset: calc(var(--border-size) * -1);
        border: var(--border-size) solid transparent;
        border-radius: calc(var(--radius) * 1px);
        background-attachment: fixed;
        background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
        background-repeat: no-repeat;
        background-position: 50% 50%;
        mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
        mask-clip: padding-box, border-box;
        mask-composite: intersect;
      }
      
      [data-glow-card]::before {
        background-image: radial-gradient(
          calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
        );
        filter: brightness(2);
      }
      
      [data-glow-card]::after {
        background-image: radial-gradient(
          calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
        );
      }
      
      [data-glow-card] [data-glow-card] {
        position: absolute;
        inset: 0;
        will-change: filter;
        opacity: var(--outer, 1);
        border-radius: calc(var(--radius) * 1px);
        border-width: calc(var(--border-size) * 20);
        filter: blur(calc(var(--border-size) * 10));
        background: none;
        pointer-events: none;
        border: none;
      }
      
      [data-glow-card] > [data-glow-card]::before {
        inset: -10px;
        border-width: 10px;
      }
    `;

    const getGlowStyles = () => {
      if (!glow) return style;

      return {
        "--base": base,
        "--spread": spread,
        "--radius": "14",
        "--border": "1",
        "--backdrop": variant === "glass-strong" ? "oklch(0.14 0.015 270 / 0.85)" : "oklch(0.15 0.01 270 / 0.6)",
        "--backup-border": "var(--backdrop)",
        "--size": "200",
        "--outer": "1",
        "--border-size": "calc(var(--border, 1) * 1px)",
        "--spotlight-size": "calc(var(--size, 150) * 1px)",
        "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
        backgroundImage: `radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(var(--hue, 210) 100% 70% / 0.08), transparent
        )`,
        backgroundColor: "var(--backdrop, transparent)",
        backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
        backgroundPosition: "50% 50%",
        backgroundAttachment: "fixed",
        border: "var(--border-size) solid var(--backup-border)",
        ...style,
      } as React.CSSProperties;
    };

    return (
      <>
        {glow && <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />}
        <div
          ref={internalRef}
          data-glow-card={glow ? "" : undefined}
          style={getGlowStyles()}
          className={cn(
            "relative overflow-hidden rounded-xl border border-glass-border transition-all duration-300",
            !glow && variant === "glass" && "glass",
            !glow && variant === "glass-strong" && "glass-strong",
            variant === "default" && "bg-surface-50 border-surface-100",
            (variant === "glow" || glow) && "shadow-glow-sm hover:shadow-glow-md",
            hoverEffect && "hover:border-glass-border-hover hover:translate-y-[-2px] hover:shadow-elevated",
            noise && "noise-overlay",
            className
          )}
          {...props}
        >
          {glow && <div data-glow-card></div>}
          {children}
        </div>
      </>
    );
  }
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight text-text-primary", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-text-secondary", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0 border-t border-glass-border/40 mt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
