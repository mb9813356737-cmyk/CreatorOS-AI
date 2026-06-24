"use client";

import React, { useEffect, useRef } from "react";

interface SparklesProps {
  density?: number;
  direction?: "top" | "bottom" | "left" | "right";
  speed?: number;
  color?: string;
  className?: string;
}

export function Sparkles({
  density = 100,
  direction = "bottom",
  speed = 1,
  color = "#FFFFFF",
  className,
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
    }> = [];

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : window.innerWidth;
      canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize particles
    const particleCount = Math.min(density, 120); // optimized ceiling
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedY: (Math.random() * 0.5 + 0.2) * speed * (direction === "top" ? -1 : 1),
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;

        // Reset particle position if it goes off screen
        if (direction === "bottom" && p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        } else if (direction === "top" && p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, direction, speed, color]);

  return <canvas ref={canvasRef} className={className} />;
}
