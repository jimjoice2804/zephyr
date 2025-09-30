"use client";

import fallbackImage from "@assets/fallbacks/fallback.png";
import type { Media } from "@prisma/client";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@zephyr/ui/hooks/use-toast";
import { Button } from "@zephyr/ui/shadui/button";
import { Dialog, DialogContent, DialogTitle } from "@zephyr/ui/shadui/dialog";
import { ChevronLeft, ChevronRight, Download, FileIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MediaViewerSkeleton } from "@/components/Layouts/skeletons/MediaViewerSkeleton";
import { getLanguageFromFileName } from "@/lib/codefileExtensions";
import { formatFileName } from "@/lib/formatFileName";
import { cn } from "@/lib/utils";
import { CodePreview } from "./CodePreview";
import { CustomVideoPlayer } from "./CustomVideoPlayer";
import { FileTypeWatermark } from "./FileTypeWatermark";
import { SVGViewer } from "./SVGViewer";

const FALLBACK_IMAGE = fallbackImage;

interface MediaViewerProps {
  media: Media[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const MediaViewer = ({
  media,
  initialIndex = 0,
  isOpen,
  onClose,
}: MediaViewerProps) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentMedia = media[currentIndex];
  const getMediaUrl = (mediaId: string, download = false) =>
    `/api/media/${mediaId}${download ? "?download=true" : ""}`;

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      if (!currentMedia) {
        toast({
          title: "Download Failed",
          description: "No media selected.",
          variant: "destructive",
        });
        return;
      }
      const response = await fetch(`/api/media/download/${currentMedia.id}`);

      if (response.status === 429) {
        const data = await response.json();
        toast({
          title: "Download Rate Limited",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = formatFileName(currentMedia.key);
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description:
          "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const DownloadButton = () => (
    <Button
      className="flex items-center gap-2"
      disabled={isDownloading}
      onClick={handleDownload}
      variant="secondary"
    >
      {isDownloading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Fetching file...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download {currentMedia ? formatFileName(currentMedia.key) : ""}
        </>
      )}
    </Button>
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: it rerenders
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: it's fine
  const renderMedia = () => {
    if (!currentMedia) {
      return <p className="text-destructive">No media available</p>;
    }

    switch (currentMedia.type) {
      case "IMAGE": {
        if (currentMedia.mimeType === "image/svg+xml") {
          return (
            <div
              className="relative flex h-full w-full items-center justify-center"
              style={{ minHeight: "85vh" }}
            >
              {isLoading && <MediaViewerSkeleton type="IMAGE" />}
              <SVGViewer
                className={cn(
                  "flex h-full w-full items-center justify-center",
                  isLoading && "hidden"
                )}
                onDownload={handleDownload}
                onLoad={() => setIsLoading(false)}
                url={getMediaUrl(currentMedia.id)}
              />
              {!isLoading && (
                <FileTypeWatermark showCategory={false} type="SVG" />
              )}
            </div>
          );
        }

        return (
          <div className="relative max-h-full max-w-full">
            {isLoading && <MediaViewerSkeleton type="IMAGE" />}
            <Image
              alt={`Media item ${currentIndex + 1}`}
              className={cn(
                "max-h-[85vh] object-contain",
                isLoading && "hidden"
              )}
              height={800}
              onError={(e) => {
                console.error("Image load error:", e);
                e.currentTarget.src = FALLBACK_IMAGE.src;
                setIsLoading(false);
              }}
              onLoadingComplete={() => setIsLoading(false)}
              priority
              quality={100}
              sizes="95vw"
              src={getMediaUrl(currentMedia.id)}
              width={1200}
            />
            {!isLoading && (
              <FileTypeWatermark
                showCategory={false}
                type={currentMedia.mimeType?.split("/")[1] || "image"}
              />
            )}
          </div>
        );
      }

      case "VIDEO":
        return (
          <div className="relative max-h-full max-w-full focus-within:outline-none">
            {isLoading && <MediaViewerSkeleton type="VIDEO" />}
            <CustomVideoPlayer
              className={cn(
                "max-h-[85vh] w-auto outline-hidden focus:outline-hidden focus-visible:outline-none",
                "shadow-lg transition-transform duration-200",
                isLoading && "hidden"
              )}
              onError={() => setIsLoading(false)}
              onLoadedData={() => setIsLoading(false)}
              src={getMediaUrl(currentMedia.id)}
            />
          </div>
        );

      case "AUDIO":
        return (
          <div className="flex flex-col items-center gap-4 rounded-lg bg-background/50 p-8">
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-primary/10">
              <FileIcon className="h-32 w-32 text-primary" />
            </div>
            <p className="font-medium text-lg">
              {formatFileName(currentMedia.key)}
            </p>
            {/* biome-ignore lint/a11y/useMediaCaption:  */}
            <audio
              aria-label={`Audio ${currentIndex + 1} of ${media.length}`}
              autoPlay
              className="w-full max-w-md"
              controls
              src={getMediaUrl(currentMedia.id)}
            />
            <DownloadButton />
          </div>
        );

      case "CODE":
        return (
          <div className="w-full max-w-4xl rounded-lg bg-background/50 p-4">
            {isLoading ? (
              <MediaViewerSkeleton type="CODE" />
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {formatFileName(currentMedia.key)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {getLanguageFromFileName(currentMedia.key)}
                    </p>
                  </div>
                  <Button
                    disabled={isDownloading}
                    onClick={handleDownload}
                    variant="secondary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <CodePreview
                  className="shadow-lg"
                  fileName={formatFileName(currentMedia.key)}
                  language={getLanguageFromFileName(currentMedia.key)}
                  mediaId={currentMedia.id}
                />
              </>
            )}
          </div>
        );

      case "DOCUMENT":
        return (
          <div className="flex flex-col items-center gap-4 rounded-lg bg-background/50 p-8">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
              <FileIcon className="h-16 w-16 text-primary" />
            </div>
            <p className="font-medium">{formatFileName(currentMedia.key)}</p>
            <p className="text-muted-foreground text-sm">
              {currentMedia.mimeType}
            </p>
            <div className="flex gap-4">
              <Button
                disabled={isDownloading}
                onClick={handleDownload}
                variant="secondary"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              {currentMedia.mimeType === "application/pdf" && (
                <Button
                  onClick={() =>
                    window.open(getMediaUrl(currentMedia.id), "_blank")
                  }
                  variant="outline"
                >
                  View PDF
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return <p className="text-destructive">Unsupported media type</p>;
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-h-[95vh] max-w-[95vw] border-none bg-transparent p-0">
        <DialogTitle asChild>
          <VisuallyHidden>
            Media Viewer - {currentIndex + 1} of {media.length}
          </VisuallyHidden>
        </DialogTitle>

        <div className="relative flex h-full min-h-[50vh] w-full items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

          <Button
            aria-label="Close viewer"
            className="absolute top-2 right-2 z-50 bg-background/50 hover:bg-background/80"
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>

          {media.length > 1 && (
            <>
              <Button
                aria-label="Previous media"
                className="-translate-y-1/2 absolute top-1/2 left-2 z-50 bg-background/50 hover:bg-background/80"
                onClick={handlePrevious}
                size="icon"
                variant="ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Next media"
                className="-translate-y-1/2 absolute top-1/2 right-2 z-50 bg-background/50 hover:bg-background/80"
                onClick={handleNext}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="-translate-x-1/2 absolute bottom-4 left-1/2 z-50 rounded-full bg-background/50 px-3 py-1">
                <span className="text-sm">
                  {currentIndex + 1} / {media.length}
                </span>
              </div>
            </>
          )}

          <div className="relative flex h-full w-full items-center justify-center p-4">
            {renderMedia()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaViewer;
