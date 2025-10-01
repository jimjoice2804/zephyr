import { Button } from "@zephyr/ui/shadui/button";
import { Slider } from "@zephyr/ui/shadui/slider";
import {
  Download,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Menu,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";

type SvgViewerProps = {
  url: string;
  className?: string;
  onLoad?: () => void;
  onDownload?: () => void;
};

export function SVGViewer({
  url,
  className,
  onLoad,
  onDownload,
}: SvgViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [_dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showControls, setShowControls] = useState(!isMobile);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await document.exitFullscreen();
    } else {
      await containerRef.current?.requestFullscreen();
    }
  };

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    updateDimensions();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        // @ts-expect-error
        x: e.touches[0].clientX - position.x,
        // @ts-expect-error
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        // @ts-expect-error
        x: e.touches[0].clientX - dragStart.x,
        // @ts-expect-error
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // biome-ignore lint/correctness/noNestedComponentDefinitions: Controls component uses parent state and is tightly coupled
  const Controls = () => (
    <div
      className={cn(
        "z-50 flex flex-col gap-4 rounded-lg bg-background/80 p-4 backdrop-blur-sm",
        isMobile
          ? showControls
            ? "fixed inset-x-0 bottom-0 mx-4 mb-4 transition-transform duration-300"
            : "fixed inset-x-0 bottom-0 mx-4 mb-4 translate-y-full transition-transform duration-300"
          : "absolute top-4 right-4"
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            className="bg-background/50 hover:bg-background/80"
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
            size={isMobile ? "sm" : "icon"}
            variant="secondary"
          >
            <ZoomOut className={cn("h-4 w-4", isMobile && "mr-2")} />
            {isMobile && "Zoom Out"}
          </Button>
          <Button
            className="bg-background/50 hover:bg-background/80"
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 5))}
            size={isMobile ? "sm" : "icon"}
            variant="secondary"
          >
            <ZoomIn className={cn("h-4 w-4", isMobile && "mr-2")} />
            {isMobile && "Zoom In"}
          </Button>
        </div>
        <Slider
          className={isMobile ? "w-full" : "w-32"}
          max={5}
          min={0.1}
          onValueChange={([value]) => value !== undefined && setScale(value)}
          step={0.1}
          value={[scale]}
        />
      </div>

      <div className={cn("flex gap-2", isMobile && "flex-wrap")}>
        <Button
          className="bg-background/50 hover:bg-background/80"
          onClick={() => setRotation((prev) => prev - 90)}
          size={isMobile ? "sm" : "icon"}
          variant="secondary"
        >
          <RotateCcw className={cn("h-4 w-4", isMobile && "mr-2")} />
          {isMobile && "Rotate Left"}
        </Button>
        <Button
          className="bg-background/50 hover:bg-background/80"
          onClick={() => setRotation((prev) => prev + 90)}
          size={isMobile ? "sm" : "icon"}
          variant="secondary"
        >
          <RotateCw className={cn("h-4 w-4", isMobile && "mr-2")} />
          {isMobile && "Rotate Right"}
        </Button>
        <Button
          className={cn(
            "bg-background/50 hover:bg-background/80",
            flipX && "bg-primary/20"
          )}
          onClick={() => setFlipX((prev) => !prev)}
          size={isMobile ? "sm" : "icon"}
          variant="secondary"
        >
          <FlipHorizontal className={cn("h-4 w-4", isMobile && "mr-2")} />
          {isMobile && "Flip H"}
        </Button>
        <Button
          className={cn(
            "bg-background/50 hover:bg-background/80",
            flipY && "bg-primary/20"
          )}
          onClick={() => setFlipY((prev) => !prev)}
          size={isMobile ? "sm" : "icon"}
          variant="secondary"
        >
          <FlipVertical className={cn("h-4 w-4", isMobile && "mr-2")} />
          {isMobile && "Flip V"}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          className="bg-background/50 hover:bg-background/80"
          onClick={toggleFullscreen}
          size={isMobile ? "sm" : "icon"}
          variant="secondary"
        >
          {isFullscreen ? (
            <Minimize2 className={cn("h-4 w-4", isMobile && "mr-2")} />
          ) : (
            <Maximize2 className={cn("h-4 w-4", isMobile && "mr-2")} />
          )}
          {isMobile && (isFullscreen ? "Exit Fullscreen" : "Fullscreen")}
        </Button>
        <Button
          className="bg-background/50 hover:bg-background/80"
          onClick={resetView}
          size={isMobile ? "sm" : "icon"}
          variant="secondary"
        >
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: Not needed */}
          <svg
            className={cn("h-4 w-4", isMobile && "mr-2")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 4v5h5M4 20v-5h5M20 4v5h-5M20 20v-5h-5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          {isMobile && "Reset"}
        </Button>
        {onDownload && (
          <Button
            className="bg-background/50 hover:bg-background/80"
            onClick={onDownload}
            size={isMobile ? "sm" : "icon"}
            variant="secondary"
          >
            <Download className={cn("h-4 w-4", isMobile && "mr-2")} />
            {isMobile && "Download"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center",
        className
      )}
      ref={containerRef}
      style={{ minHeight: "50vh" }}
    >
      {isMobile && (
        <Button
          className="absolute top-4 right-4 z-50 bg-background/50"
          onClick={() => setShowControls(!showControls)}
          size="icon"
          variant="ghost"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      <Controls />

      <div
        className="relative h-full w-full flex-1 overflow-hidden"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: SVG viewer needs mouse interactions for panning */}
        <div
          className="cursor-move"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <iframe
            className="h-full w-full"
            onError={() => {
              setHasError(true);
              onLoad?.();
            }}
            onLoad={(_e) => {
              setHasError(false);
              onLoad?.();
            }}
            ref={iframeRef}
            src={url}
            style={{
              transform: `
                translate(${position.x}px, ${position.y}px)
                scale(${scale})
                rotate(${rotation}deg)
                scaleX(${flipX ? -1 : 1})
                scaleY(${flipY ? -1 : 1})
              `,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.2s ease-in-out",
              border: "none",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            title="SVG Viewer"
          />
        </div>
      </div>

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <p className="text-destructive">Failed to load SVG file</p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 rounded-sm bg-background/80 px-2 py-1 text-sm">
        {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
}
