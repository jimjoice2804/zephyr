import type { Media } from "@prisma/client";
import { Button } from "@zephyr/ui/shadui/button";
import { AnimatePresence, motion } from "framer-motion";
import { FileAudioIcon, FileCode, FileIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import { useMediaQuery } from "usehooks-ts";
import { getLanguageFromFileName } from "@/lib/codefileExtensions";
import { formatFileName } from "@/lib/formatFileName";
import { cn } from "@/lib/utils";
import { FileTypeWatermark } from "./FileTypeWatermark";
import MediaViewer from "./MediaViewer";

type MediaPreviewsProps = {
  attachments: Media[];
};

export function MediaPreviews({ attachments }: MediaPreviewsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const getMediaUrl = (mediaId: string) => `/api/media/${mediaId}`;

  const videoOverlayVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.05 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const initialCount = isMobile ? 2 : 3;
  const visibleAttachments = showAll
    ? attachments
    : attachments.slice(0, initialCount);
  const remainingAttachments = attachments.slice(initialCount);
  const remainingCount = attachments.length - initialCount;

  const renderPreview = (m: Media, _index: number, isSmall = false) => {
    const commonClasses = cn(
      "mx-auto w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105",
      isSmall ? "h-20" : "h-48"
    );

    switch (m.type) {
      case "IMAGE": {
        if (m.mimeType === "image/svg+xml") {
          return (
            <div
              className={cn("group relative w-full", isSmall ? "h-20" : "h-48")}
            >
              <object
                className={commonClasses}
                data={getMediaUrl(m.id)}
                type="image/svg+xml"
              >
                Your browser does not support SVG
              </object>
              <FileTypeWatermark type="SVG" />
              <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0" />
            </div>
          );
        }
        return (
          <div
            className={cn("group relative w-full", isSmall ? "h-20" : "h-48")}
          >
            <Image
              alt="Attachment"
              className={commonClasses}
              fill
              src={getMediaUrl(m.id)}
              style={{ objectFit: "cover" }}
            />
            <FileTypeWatermark
              type={m.key.split(".").pop()?.toUpperCase() || "FILE"}
            />
            <div className="absolute inset-0 bg-black/5 transition-opacity group-hover:opacity-0" />
          </div>
        );
      }

      case "VIDEO":
        return (
          <div
            className={cn(
              "group relative w-full overflow-hidden",
              isSmall ? "h-20" : "h-48"
            )}
          >
            {/* biome-ignore lint/a11y/useMediaCaption: suppress */}
            <video
              className={commonClasses}
              preload="metadata"
              src={getMediaUrl(m.id)}
            />

            <motion.div
              animate="animate"
              className="absolute inset-0 flex items-center justify-center"
              exit="exit"
              initial="initial"
              variants={videoOverlayVariants}
              whileHover="hover"
            >
              <div className="relative">
                <div className="-inset-4 absolute">
                  <div className="absolute inset-0 rounded-full bg-white/10 group-hover:animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute inset-0 rounded-full bg-black/20 blur-xs group-hover:animate-pulse" />
                </div>

                <motion.div
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-xs transition-colors duration-300 group-hover:bg-white/20"
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                >
                  <MdPlayArrow
                    className={cn(
                      "transition-all duration-300",
                      isSmall ? "h-6 w-6" : "h-8 w-8",
                      "text-white group-hover:text-white",
                      "group-hover:scale-110"
                    )}
                  />
                </motion.div>
              </div>

              <FileTypeWatermark type={m.key.split(".").pop() || "FILE"} />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 transition-all duration-300 group-hover:opacity-20" />
          </div>
        );

      case "AUDIO":
        return (
          <div
            className={cn("group relative w-full", isSmall ? "h-20" : "h-48")}
          >
            <div className="h-full w-full rounded-lg bg-primary/5 p-4 transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <FileAudioIcon
                  className={cn(
                    "text-primary",
                    isSmall ? "h-6 w-6" : "h-12 w-12"
                  )}
                />
                {!isSmall && (
                  <p className="max-w-full truncate font-medium text-sm">
                    {formatFileName(m.key)}
                  </p>
                )}
              </div>
            </div>
            <FileTypeWatermark
              type={m.key.split(".").pop()?.toUpperCase() || "FILE"}
            />
          </div>
        );

      case "CODE":
        return (
          <div
            className={cn("group relative w-full", isSmall ? "h-20" : "h-48")}
          >
            <div className="h-full w-full rounded-lg bg-primary/5 p-4 transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <FileCode
                  className={cn(
                    "text-primary",
                    isSmall ? "h-6 w-6" : "h-12 w-12"
                  )}
                />
                {!isSmall && (
                  <div className="flex flex-col items-center">
                    <p className="max-w-full truncate font-medium text-sm">
                      {formatFileName(m.key)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {getLanguageFromFileName(m.key)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <FileTypeWatermark
              type={m.key.split(".").pop()?.toUpperCase() || "FILE"}
            />
          </div>
        );

      case "DOCUMENT":
        return (
          <div
            className={cn("group relative w-full", isSmall ? "h-20" : "h-48")}
          >
            <div className="h-full w-full rounded-lg bg-primary/5 p-4 transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <FileIcon
                  className={cn(
                    "text-primary",
                    isSmall ? "h-6 w-6" : "h-12 w-12"
                  )}
                />
                {!isSmall && (
                  <p className="max-w-full truncate font-medium text-sm">
                    {formatFileName(m.key)}
                  </p>
                )}
              </div>
            </div>
            <FileTypeWatermark
              type={m.key.split(".").pop()?.toUpperCase() || "FILE"}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // biome-ignore lint/correctness/noNestedComponentDefinitions: GridPreview uses parent component props and state, making it reasonable to keep nested
  const GridPreview = ({
    media,
    index,
    size = "large",
  }: {
    media: Media;
    index: number;
    size?: "small" | "large";
  }) => {
    const isSmall = size === "small";
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "hover:-translate-y-0.5 relative cursor-pointer overflow-hidden rounded-lg shadow-xs transition-all duration-300 hover:shadow-md",
          isSmall ? "h-20" : "h-48"
        )}
        exit={{ opacity: 0, y: -20 }}
        initial={{ opacity: 0, y: 20 }}
        layout
        onClick={() => setSelectedIndex(index)}
        transition={{ duration: 0.2, delay: index * 0.05 }}
      >
        {renderPreview(media, index, isSmall)}
      </motion.div>
    );
  };

  // biome-ignore lint/correctness/noNestedComponentDefinitions: ShowMoreSection uses parent component state, making it reasonable to keep nested
  const ShowMoreSection = () => {
    if (isMobile) {
      return (
        <motion.div
          animate={{ opacity: 1 }}
          className="px-4 pb-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          layout
        >
          <div className="relative w-full overflow-hidden rounded-lg bg-primary/5 p-4 shadow-xs transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">
                  {remainingCount} more items
                </p>
                <Button
                  onClick={() => setShowAll(true)}
                  size="sm"
                  variant="secondary"
                >
                  Show All
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {remainingAttachments.map((m, index) => (
                  <GridPreview
                    index={index + initialCount}
                    key={m.id}
                    media={m}
                    size="small"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        animate={{ opacity: 1 }}
        className="px-4 pb-4"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        layout
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Interactive div for showing more media */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Click handler for expanding media view */}
        <div
          className="relative w-full cursor-pointer overflow-hidden rounded-lg bg-primary/5 shadow-xs transition-all duration-300 hover:bg-primary/10 hover:shadow-md"
          onClick={() => setShowAll(true)}
        >
          <div className="flex h-32 items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {remainingAttachments.slice(0, 2).map((m, index) => (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  className="relative h-24 w-24 overflow-hidden rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  key={m.id}
                  transition={{ delay: index * 0.1 }}
                >
                  {renderPreview(m, index + initialCount)}
                  <div className="absolute inset-0 bg-black/10" />
                </motion.div>
              ))}
            </div>

            <motion.div
              animate={{ opacity: 1 }}
              className="flex flex-col items-end gap-2 pr-4"
              initial={{ opacity: 0 }}
            >
              <p className="font-medium text-lg">Show {remainingCount} more</p>
              <Button variant="secondary">Expand</Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div className="w-full" layout>
      <div
        className={cn(
          "grid gap-4 p-4",
          visibleAttachments.length === 1
            ? "grid-cols-1"
            : isMobile
              ? "grid-cols-2"
              : visibleAttachments.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
        )}
      >
        <AnimatePresence mode="wait">
          {visibleAttachments.map((m, index) => (
            <GridPreview index={index} key={m.id} media={m} />
          ))}
        </AnimatePresence>
      </div>

      {!showAll && attachments.length > initialCount && <ShowMoreSection />}

      <AnimatePresence>
        {showAll && (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex justify-center pb-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <Button
              onClick={() => setShowAll(false)}
              size={isMobile ? "sm" : "default"}
              variant="ghost"
            >
              Show Less
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedIndex !== null && (
        <MediaViewer
          initialIndex={selectedIndex}
          isOpen={selectedIndex !== null}
          media={attachments}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </motion.div>
  );
}
