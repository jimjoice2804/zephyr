"use client";

import { UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { formatNumber } from "@/lib/utils";

type FollowingCountProps = {
  count: number;
  onClick?: () => void;
};

export default function FollowingCount({
  count,
  onClick,
}: FollowingCountProps) {
  return (
    <motion.button
      className="group flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-accent/50"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        initial={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        whileHover={{ rotate: 10 }}
      >
        <UserPlus className="h-4 w-4 text-primary group-hover:text-primary/80" />
      </motion.div>
      <span>
        <span className="font-semibold">{formatNumber(count)}</span>{" "}
        <span className="text-muted-foreground transition-colors group-hover:text-foreground">
          Following
        </span>
      </span>
    </motion.button>
  );
}
