import { useToast } from "@zephyr/ui/hooks/use-toast";
import { Button } from "@zephyr/ui/shadui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@zephyr/ui/shadui/dialog";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useUpdateAvatarMutation } from "@/app/(main)/users/[username]/avatar-mutations";
import LoadingButton from "@/components/Auth/loading-button";

type GifCenteringDialogProps = {
  gifFile: File;
  onClose: () => void;
  currentValues: {
    displayName: string;
    bio: string;
    userId: string;
    oldAvatarKey?: string | null;
  };
};

export default function GifCenteringDialog({
  gifFile,
  onClose,
  currentValues,
}: GifCenteringDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gifRef = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const mutation = useUpdateAvatarMutation();
  const { toast } = useToast();

  const MoveAmount = 10;
  const ZoomStep = 0.1;
  const MinZoom = 0.5;
  const MaxZoom = 2;

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    setPosition((prev) => {
      switch (direction) {
        case "up":
          return { ...prev, y: prev.y + MoveAmount };
        case "down":
          return { ...prev, y: prev.y - MoveAmount };
        case "left":
          return { ...prev, x: prev.x + MoveAmount };
        case "right":
          return { ...prev, x: prev.x - MoveAmount };
        default:
          return prev;
      }
    });
  };

  const handleZoom = (increase: boolean) => {
    setZoom((prev) => {
      const newZoom = increase ? prev + ZoomStep : prev - ZoomStep;
      return Math.min(Math.max(newZoom, MinZoom), MaxZoom);
    });
  };

  const handleComplete = async () => {
    try {
      const timestamp = Date.now();
      const safePosition = {
        x: Math.round(position.x * 100) / 100,
        y: Math.round(position.y * 100) / 100,
        z: Math.round(zoom * 100) / 100,
      };

      const transformedFileName = `avatar_${timestamp}_x${safePosition.x}_y${safePosition.y}_z${safePosition.z}.gif`;

      const file = new File([gifFile], transformedFileName, {
        type: "image/gif",
      });

      await mutation.mutateAsync({
        file,
        userId: currentValues.userId,
        oldAvatarKey: currentValues.oldAvatarKey || undefined,
      });

      onClose();
    } catch (error) {
      console.error("Error processing GIF:", error);
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog onOpenChange={onClose} open>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Center Your GIF</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            className="relative size-64 overflow-hidden rounded-full border-2 border-border bg-secondary"
            ref={containerRef}
          >
            <motion.div
              animate={{
                x: position.x,
                y: position.y,
                scale: zoom,
              }}
              className="absolute inset-0 flex items-center justify-center"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Image
                alt="GIF preview"
                className="max-w-none"
                draggable={false}
                layout="fill"
                objectFit="contain"
                ref={gifRef}
                src={URL.createObjectURL(gifFile)}
                style={{
                  transformOrigin: "center",
                }}
              />
            </motion.div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <Button
                disabled={mutation.isPending}
                onClick={() => handleMove("up")}
                size="icon"
                variant="outline"
              >
                <ChevronUp className="size-4" />
              </Button>
              <div />

              <Button
                disabled={mutation.isPending}
                onClick={() => handleMove("left")}
                size="icon"
                variant="outline"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Move</span>
              </div>
              <Button
                disabled={mutation.isPending}
                onClick={() => handleMove("right")}
                size="icon"
                variant="outline"
              >
                <ChevronRight className="size-4" />
              </Button>

              <div />
              <Button
                disabled={mutation.isPending}
                onClick={() => handleMove("down")}
                size="icon"
                variant="outline"
              >
                <ChevronDown className="size-4" />
              </Button>
              <div />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                disabled={zoom <= MinZoom || mutation.isPending}
                onClick={() => handleZoom(false)}
                size="icon"
                variant="outline"
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="min-w-12 text-center text-sm">
                {(zoom * 100).toFixed(0)}%
              </span>
              <Button
                disabled={zoom >= MaxZoom || mutation.isPending}
                onClick={() => handleZoom(true)}
                size="icon"
                variant="outline"
              >
                <ZoomIn className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={mutation.isPending}
            onClick={onClose}
            variant="ghost"
          >
            Cancel
          </Button>
          <LoadingButton loading={mutation.isPending} onClick={handleComplete}>
            Apply Changes
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
