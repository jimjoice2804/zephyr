"use client";

// @ts-expect-error - no types for images
import signupImage from "@assets/auth/signup-image.jpg";
// @ts-expect-error - no types for images
import loginImage from "@assets/previews/login.png";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AnimatedAuthLink from "@/components/Auth/AnimatedAuthLink";
import SignUpForm from "@/components/Auth/SignUpForm";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const slideIn = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
    },
  },
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
    },
  },
};

const contentAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1,
      ease: "easeOut",
    },
  }),
};

const AnimatedZephyrText = () => {
  const letters = "ZEPHYR.".split("");

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="pointer-events-none fixed bottom-4 left-4 z-10 select-none font-bold text-4xl sm:text-6xl"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 0.7 }}
    >
      <div className="relative flex">
        {letters.map((letter, i) => (
          <motion.span
            animate={{
              opacity: [0, 1, 1, 0.3, 1],
              y: [20, 0, 0, 0, 0],
            }}
            className="text-primary/50"
            initial={{ opacity: 0, y: 20 }}
            key={i}
            style={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              display: "inline-block",
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.1,
              times: [0, 0.2, 0.5, 0.8, 1],
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
      <motion.div
        animate={{
          scaleX: [0, 1, 1, 1, 0],
          opacity: [0, 1, 1, 0.3, 0],
        }}
        className="absolute bottom-0 left-0 h-0.5 bg-primary/30"
        initial={{ scaleX: 0 }}
        style={{ transformOrigin: "left" }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.8, 1],
        }}
      />
    </motion.div>
  );
};

export default function ClientSignupPage() {
  return (
    <AnimatePresence>
      <motion.div
        animate="visible"
        className="relative flex min-h-screen overflow-hidden bg-background"
        initial="hidden"
        variants={fadeIn}
      >
        <div className="absolute inset-0 z-0 bg-gradient-to-bl from-primary/5 via-background to-background/95" />

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 z-20 w-full"
          initial={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="mx-auto w-full max-w-5xl p-2 sm:p-3">
            <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-50/90 px-3 py-2 text-amber-900 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-amber-50/60 sm:items-center dark:border-amber-400/20 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500 sm:h-4 sm:w-4 dark:text-amber-300" />
              <p className="text-xs leading-snug sm:text-sm">
                We’re collaborating on a Zephyr ×{" "}
                <Link
                  className="underline decoration-amber-400/60 underline-offset-2 hover:decoration-amber-400"
                  href="https://singularityworks.xyz"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Singularity Works
                </Link>{" "}
                UI revamp. Some services may be intermittently unavailable; you
                may encounter errors ex: signup using email does not work, use
                google or github etc. Thanks for your patience.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute right-20 hidden h-full items-center md:flex"
          variants={slideIn}
        >
          <div className="relative">
            <h1 className="vertical-right -translate-y-1/2 absolute top-1/2 right-0 select-none whitespace-nowrap font-bold text-6xl text-primary/20 tracking-wider xl:text-8xl 2xl:text-9xl">
              SIGN UP
            </h1>
          </div>
        </motion.div>

        <div className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-8">
          <motion.div
            className="relative flex w-full max-w-5xl flex-col rounded-2xl border border-white/10 bg-card/40 shadow-2xl backdrop-blur-xl lg:flex-row"
            variants={scaleUp}
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
          >
            <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 sm:px-8 lg:w-1/2">
              <div className="mx-auto w-full max-w-sm">
                <motion.h2
                  className="mb-6 text-center font-bold text-3xl text-primary sm:text-4xl"
                  custom={0}
                  variants={contentAnimation}
                >
                  Launch Your Journey
                </motion.h2>

                <motion.div custom={1} variants={contentAnimation}>
                  <SignUpForm />
                </motion.div>

                <motion.div
                  className="mt-6 text-center"
                  custom={2}
                  variants={contentAnimation}
                >
                  <AnimatedAuthLink
                    href="/login"
                    previewImage={loginImage.src}
                    text="Already have an account? Login"
                  />
                </motion.div>
              </div>
            </div>

            <div className="overflow-hidden rounded-r-2xl lg:w-1/2">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="relative min-h-[200px] w-full bg-primary/80 lg:min-h-[650px]"
                initial={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20"
                  initial={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                />
                <Image
                  alt="Signup illustration"
                  className="object-cover brightness-95"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={signupImage}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <AnimatedZephyrText />

        <motion.div
          animate={{ opacity: 0.05 }}
          className="absolute top-0 left-0 h-full w-full bg-center bg-cover opacity-5 blur-md lg:w-1/2"
          initial={{ opacity: 0 }}
          style={{ backgroundImage: `url(${signupImage.src})` }}
          transition={{ duration: 1 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
