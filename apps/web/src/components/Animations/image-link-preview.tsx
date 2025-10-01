"use client";

import {
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HelpLinkProps = {
  href: string;
  text: string;
  previewImage: string;
};

const PreviewCursor = ({
  mouseX,
  mouseY,
  isHovered,
  previewImage,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isHovered: boolean;
  previewImage: string;
}) => {
  const springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  };

  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  const rotate = useSpring(0, {
    damping: 10,
    stiffness: 100,
    mass: 0.1,
  });

  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        rotate.set(Math.random() * 4 - 2);
      }, 200);
      return () => clearInterval(interval);
    }
    rotate.set(0);
  }, [isHovered, rotate]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[99999] hidden md:block"
      style={{
        x,
        y,
        rotate,
        translateX: "-50%",
        translateY: "-120%",
        position: "fixed",
      }}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
        }}
        className="relative h-[100px] w-[160px] overflow-hidden rounded-lg border border-primary/10 bg-background/80 shadow-lg backdrop-blur-sm"
        initial={{ scale: 0, opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        <motion.div
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          className="absolute inset-0"
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <Image
            alt="Preview"
            className="object-cover opacity-90"
            fill
            sizes="160px"
            src={previewImage}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
      </motion.div>
    </motion.div>
  );
};

export function HelpLink({ href, text, previewImage }: HelpLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY, isMobile]);

  return (
    <>
      <Link
        className="group relative inline-block px-2 py-1"
        href={href}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative"
          exit={{ opacity: 0, y: -10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          <span className="relative z-10 text-muted-foreground text-sm transition-colors duration-300 group-hover:text-primary">
            {text}
          </span>

          <motion.span
            className="absolute bottom-0 left-0 h-[1px] w-full bg-primary/50"
            initial={{ scaleX: 0, originX: 0 }}
            whileHover={{
              scaleX: 1,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            }}
          />
        </motion.div>
      </Link>

      {!isMobile && (
        <div className="relative">
          <PreviewCursor
            isHovered={isHovered}
            mouseX={mouseX}
            mouseY={mouseY}
            previewImage={previewImage}
          />
        </div>
      )}
    </>
  );
}
