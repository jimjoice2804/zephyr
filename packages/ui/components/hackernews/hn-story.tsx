"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Bookmark,
  Clock,
  ExternalLink,
  Link,
  MessageCircle,
  Share2,
  ThumbsUp,
  User,
  // @ts-expect-error - lucide-react is not typed
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { toast } from "../../hooks/use-toast";
import { cn } from "../../lib/utils";
import { Badge } from "../../shadui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../shadui/tooltip";
import { useHnShareStore } from "../../store/hn-share-store";

const storyVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: {
    backgroundColor: "var(--background-hover)",
    transition: { duration: 0.2 },
  },
};

const iconButtonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.1 },
};

type HnStoryProps = {
  story: {
    id: number;
    title: string;
    url?: string;
    by: string;
    time: number;
    score: number;
    descendants: number;
  };
};

export function HNStory({ story }: HnStoryProps) {
  const domain = story.url ? new URL(story.url).hostname : null;
  const timeAgo = formatDistanceToNow(story.time * 1000, { addSuffix: true });
  const hnShareStore = useHnShareStore();
  const router = useRouter();

  const handleShareToZephyr = (e: React.MouseEvent) => {
    e.stopPropagation();
    hnShareStore.startSharing({
      id: story.id,
      title: story.title,
      url: story.url,
      by: story.by,
      time: story.time,
      score: story.score,
      descendants: story.descendants,
    });
    toast({
      title: "Story ready to share",
      description: "Add your thoughts and share with your followers",
    });
    router.push("/");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        });
      } else {
        await navigator.clipboard.writeText(
          story.url || `https://news.ycombinator.com/item?id=${story.id}`
        );
        toast({
          title: "Copied to clipboard",
          description: "Link has been copied to your clipboard",
        });
      }
    } catch (_error) {
      // Silently fail if clipboard is not available
    }
  };

  const handleVisit = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    window.open(story.url, "_blank", "noopener,noreferrer");
  };

  const handleCommentClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation(); // Prevent event bubbling
    window.open(
      `https://news.ycombinator.com/item?id=${story.id}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const queryClient = useQueryClient();

  const { data: bookmarkData } = useQuery({
    queryKey: ["hn-bookmark", story.id],
    queryFn: async () => {
      const response = await fetch(`/api/hackernews/${story.id}/bookmark`);
      if (!response.ok) {
        throw new Error("Failed to fetch bookmark status");
      }
      return response.json();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { mutate: toggleBookmark } = useMutation({
    mutationFn: async () => {
      const method = bookmarkData?.isBookmarked ? "DELETE" : "POST";
      await fetch(`/api/hackernews/${story.id}/bookmark`, { method });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hn-bookmark", story.id] });
      queryClient.invalidateQueries({ queryKey: ["hn-bookmarks"] });
    },
  });

  return (
    <motion.div
      animate="animate"
      className="group relative px-2 py-4 sm:px-4 sm:py-6"
      initial="initial"
      variants={storyVariants}
      whileHover="hover"
    >
      <motion.div
        animate={{ opacity: 0 }}
        className="-z-10 absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        initial={false}
        whileHover={{ opacity: 0.1 }}
      />

      <div className="pointer-events-auto relative z-10 space-y-2 sm:space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <motion.a
                className="relative z-10 cursor-pointer font-medium text-xl transition-colors hover:text-orange-500"
                href={story.url}
                onClick={handleVisit}
                rel="noopener noreferrer"
                target="_blank"
                whileHover={{ x: 2 }}
              >
                {story.title}
              </motion.a>
              {domain && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.a
                        className="inline-flex items-center"
                        href={story.url}
                        onClick={handleVisit}
                        rel="noopener noreferrer"
                        target="_blank"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge
                          className="cursor-pointer text-xs hover:bg-orange-500/10 hover:text-orange-500"
                          variant="secondary"
                        >
                          <Link className="mr-1 h-3 w-3" />
                          {domain}
                        </Badge>
                      </motion.a>
                    </TooltipTrigger>
                    <TooltipContent>Visit website</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm sm:gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.a
                      className="flex items-center gap-1 hover:text-orange-500"
                      href={`https://news.ycombinator.com/user?id=${story.by}`}
                      rel="noopener noreferrer"
                      target="_blank"
                      whileHover={{ scale: 1.05 }}
                    >
                      <User className="h-4 w-4" />
                      <span>{story.by}</span>
                    </motion.a>
                  </TooltipTrigger>
                  <TooltipContent>View author profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{timeAgo}</span>
                  </TooltipTrigger>
                  <TooltipContent>Posted {timeAgo}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <motion.div
                className="flex items-center gap-1 text-orange-500"
                variants={iconButtonVariants}
                whileHover="hover"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{story.score} points</span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-4">
          <motion.button
            // @ts-expect-error
            className="group flex cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-orange-500"
            onClick={handleCommentClick}
            whileHover={{ scale: 1.05 }}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{story.descendants} comments</span>
          </motion.button>

          <motion.button
            className="group flex cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-orange-500"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </motion.button>

          <motion.button
            className="group flex cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-orange-500"
            onClick={handleShareToZephyr}
            whileHover={{ scale: 1.05 }}
          >
            <Share2 className="h-4 w-4 rotate-90" />
            <span>Share to Zephyr</span>
          </motion.button>

          <motion.button
            className={cn(
              "group flex cursor-pointer items-center gap-2 text-sm transition-colors",
              bookmarkData?.isBookmarked
                ? "text-orange-500"
                : "text-muted-foreground hover:text-orange-500"
            )}
            onClick={() => toggleBookmark()}
            whileHover={{ scale: 1.05 }}
          >
            <Bookmark className="h-4 w-4" />
            <span>{bookmarkData?.isBookmarked ? "Saved" : "Save"}</span>
          </motion.button>

          {story.url && (
            <motion.button
              // @ts-expect-error
              className="group ml-auto flex cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-orange-500"
              onClick={handleVisit}
              whileHover={{ scale: 1.05 }}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Visit</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
