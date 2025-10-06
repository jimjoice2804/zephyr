"use client";

import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { SparklesCore } from "./sparkles";

export const Cover = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const [hovered, setHovered] = useState(false);

  const ref = useRef<HTMLSpanElement>(null);

  const [containerWidth, setContainerWidth] = useState(0);
  const [beamPositions, setBeamPositions] = useState<number[]>([]);

  useEffect(() => {
    if (ref.current) {
      setContainerWidth(ref.current?.clientWidth ?? 0);

      const height = ref.current?.clientHeight ?? 0;
      const numberOfBeams = Math.floor(height / 10);
      const positions = Array.from(
        { length: numberOfBeams },
        (_, i) => (i + 1) * (height / (numberOfBeams + 1))
      );
      setBeamPositions(positions);
    }
  }, []);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Presentational hover effects only
    // biome-ignore lint/a11y/noStaticElementInteractions: Presentational hover effects only
    <span
      className="group/cover relative inline-block rounded-xs bg-neutral-100 px-2 py-2 transition duration-200 hover:bg-neutral-900 dark:bg-neutral-900"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 h-full w-full overflow-hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: 0.2,
              },
            }}
          >
            <motion.div
              animate={{
                translateX: ["-50%", "0%"],
              }}
              className="flex h-full w-[200%]"
              transition={{
                translateX: {
                  duration: 10,
                  ease: "linear",
                  repeat: Number.POSITIVE_INFINITY,
                },
              }}
            >
              <SparklesCore
                background="transparent"
                className="h-full w-full"
                maxSize={1}
                minSize={0.4}
                particleColor="hsl(var(--primary))"
                particleDensity={500}
              />
              <SparklesCore
                background="transparent"
                className="h-full w-full"
                maxSize={1}
                minSize={0.4}
                particleColor="hsl(var(--primary))"
                particleDensity={500}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {beamPositions.map((position, _index) => (
        <Beam
          delay={Math.random() * 2 + 1}
          duration={Math.random() * 2 + 1}
          hovered={hovered}
          key={`beam-${position}`}
          style={{
            top: `${position}px`,
          }}
          width={containerWidth}
        />
      ))}
      <motion.span
        animate={{
          scale: hovered ? 0.8 : 1,
          x: hovered ? [0, -30, 30, -30, 30, 0] : 0,
          y: hovered ? [0, 30, -30, 30, -30, 0] : 0,
        }}
        className={cn(
          "relative z-20 inline-block text-foreground transition duration-200 group-hover/cover:text-primary",
          className
        )}
        exit={{
          filter: "none",
          scale: 1,
          x: 0,
          y: 0,
        }}
        key={String(hovered)}
        transition={{
          duration: 0.2,
          x: {
            duration: 0.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          },
          y: {
            duration: 0.2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          },
          scale: {
            duration: 0.2,
          },
          filter: {
            duration: 0.2,
          },
        }}
      >
        {children}
      </motion.span>
      <CircleIcon className="-right-[2px] -top-[2px] absolute" />
      <CircleIcon className="-bottom-[2px] -right-[2px] absolute" delay={0.4} />
      <CircleIcon className="-left-[2px] -top-[2px] absolute" delay={0.8} />
      <CircleIcon className="-bottom-[2px] -left-[2px] absolute" delay={1.6} />
    </span>
  );
};

export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  ...svgProps
}: {
  className?: string;
  delay?: number;
  duration?: number;
  hovered?: boolean;
  width?: number;
} & React.ComponentProps<typeof motion.svg>) => {
  const id = useId();

  return (
    <motion.svg
      className={cn("absolute inset-x-0 w-full", className)}
      fill="none"
      height="1"
      viewBox={`0 0 ${width ?? "600"} 1`}
      width={width ?? "600"}
      xmlns="http://www.w3.org/2000/svg"
      {...svgProps}
    >
      <title>Beam animation</title>
      <motion.path
        d={`M0 0.5H${width ?? "600"}`}
        stroke={`url(#svgGradient-${id})`}
      />

      <defs>
        <motion.linearGradient
          animate={{
            x1: "110%",
            x2: hovered ? "100%" : "105%",
            y1: 0,
            y2: 0,
          }}
          gradientUnits="userSpaceOnUse"
          id={`svgGradient-${id}`}
          initial={{
            x1: "0%",
            x2: hovered ? "-10%" : "-5%",
            y1: 0,
            y2: 0,
          }}
          key={String(hovered)}
          transition={{
            duration: hovered ? 0.5 : (duration ?? 2),
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
            delay: hovered ? Math.random() * (1 - 0.2) + 0.2 : 0,
            repeatDelay: hovered ? Math.random() * (2 - 1) + 1 : (delay ?? 1),
          }}
        >
          <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  );
};

export const CircleIcon = ({
  className,
}: {
  className?: string;
  delay?: number;
}) => (
  <div
    className={cn(
      "group pointer-events-none h-2 w-2 animate-pulse rounded-full bg-neutral-600 opacity-20 group-hover/cover:hidden group-hover/cover:bg-white group-hover/cover:opacity-100 dark:bg-white",
      className
    )}
  />
);
