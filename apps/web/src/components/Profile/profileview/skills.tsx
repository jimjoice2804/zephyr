"use client";

import { Badge } from "@zephyr/ui/shadui/badge";
import { Card, CardContent } from "@zephyr/ui/shadui/card";
import { motion } from "framer-motion";
import type React from "react";

type SkillsProps = {
  skills: string[];
};

const Skills: React.FC<SkillsProps> = ({ skills }) => (
  <Card className="bg-card text-card-foreground">
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase">
        Skills
      </h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <motion.div
            key={skill}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              className="bg-secondary text-secondary-foreground"
              variant="secondary"
            >
              {skill}
            </Badge>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default Skills;
