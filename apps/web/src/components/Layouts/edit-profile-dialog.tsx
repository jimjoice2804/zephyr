import avatarPlaceholder from "@assets/general/avatar-placeholder.png";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateUserProfileValues,
  updateUserProfileSchema,
} from "@zephyr/auth/validation";
import type { UserData } from "@zephyr/db";
import { useToast } from "@zephyr/ui/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@zephyr/ui/shadui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@zephyr/ui/shadui/form";
import { Input } from "@zephyr/ui/shadui/input";
import { Label } from "@zephyr/ui/shadui/label";
import { Textarea } from "@zephyr/ui/shadui/textarea";
import { Camera } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import Resizer from "react-image-file-resizer";
import {
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from "@/app/(main)/users/[username]/avatar-mutations";
import LoadingButton from "@/components/Auth/LoadingButton";
import { AnimatedWordCounter } from "@/components/misc/AnimatedWordCounter";
import { cn } from "@/lib/utils";
import { getSecureImageUrl } from "@/lib/utils/imageUrl";
import CropImageDialog from "./crop-image-dialog";
import GifCenteringDialog from "./GifCenteringDialog";

type EditProfileDialogProps = {
  user: UserData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const regex = /\s+/;

export default function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const { toast } = useToast();
  const form = useForm<UpdateUserProfileValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio || "",
    },
  });

  const [croppedAvatar, setCroppedAvatar] = useState<Blob | null>(null);
  const [gifToCenter, setGifToCenter] = useState<File | null>(null);
  const mutation = useUpdateAvatarMutation();
  const profileMutation = useUpdateProfileMutation();
  const isUpdating = mutation.isPending || profileMutation.isPending;

  useEffect(() => {
    if (!open) {
      setCroppedAvatar(null);
      setGifToCenter(null);
      form.reset({
        displayName: user.displayName,
        bio: user.bio || "",
      });
    }
  }, [open, user, form.reset]);

  const checkForChanges = (values: UpdateUserProfileValues) => {
    const hasProfileChanges =
      values.displayName !== user.displayName || values.bio !== user.bio;
    const hasAvatarChanges = croppedAvatar || gifToCenter;
    return { hasProfileChanges, hasAvatarChanges };
  };

  const updateProfile = async (values: UpdateUserProfileValues) => {
    await profileMutation.mutateAsync({
      values,
      userId: user.id,
    });
  };

  const updateAvatar = async () => {
    const file = croppedAvatar
      ? new File([croppedAvatar], `avatar_${user.id}.webp`, {
          type: "image/webp",
        })
      : gifToCenter;

    if (file) {
      await mutation.mutateAsync({
        file,
        userId: user.id,
        oldAvatarKey: user.avatarKey || undefined,
      });
    }
  };

  const handleSubmit = async (values: UpdateUserProfileValues) => {
    try {
      const { hasProfileChanges, hasAvatarChanges } = checkForChanges(values);

      if (!(hasProfileChanges || hasAvatarChanges)) {
        toast({
          title: "No changes",
          description: "No changes were made to your profile",
        });
        return;
      }

      if (hasProfileChanges) {
        await updateProfile(values);
      }

      if (hasAvatarChanges) {
        await updateAvatar();
      }

      onOpenChange(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Avatar</Label>
          <AvatarInput
            form={form}
            isUploading={mutation.isPending}
            onGifSelected={setGifToCenter}
            onImageCropped={setCroppedAvatar}
            src={
              croppedAvatar
                ? URL.createObjectURL(croppedAvatar)
                : (user.avatarUrl ?? avatarPlaceholder.src)
            }
            user={user}
          />
        </div>
        <Form {...form}>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <div className="space-y-1">
                      <Textarea
                        className="resize-none"
                        placeholder="Tell us a little bit about yourself"
                        {...field}
                      />
                      <div className="flex justify-end">
                        <AnimatedWordCounter
                          current={
                            field.value.trim().split(regex).filter(Boolean)
                              .length
                          }
                          max={400}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton loading={isUpdating} type="submit">
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type AvatarInputProps = {
  src: string | StaticImageData;
  onImageCropped: (blob: Blob | null) => void;
  onGifSelected: (file: File | null) => void;
  form: UseFormReturn<UpdateUserProfileValues>;
  isUploading: boolean;
  user: UserData;
};

function AvatarInput({
  src,
  onImageCropped,
  onGifSelected,
  form,
  isUploading,
  user,
}: AvatarInputProps) {
  const { toast } = useToast();
  const [imageToCrop, setImageToCrop] = useState<File>();
  const [gifToCenter, setGifToCenter] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarSrc = useMemo(() => {
    if (typeof src === "string") {
      return getSecureImageUrl(src);
    }
    return avatarPlaceholder.src;
  }, [src]);

  const resetInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const onImageSelected = useCallback(
    (file: File | undefined) => {
      if (!file) {
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Image must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      if (file.type === "image/gif") {
        setGifToCenter(file);
        onGifSelected(file);
        return;
      }

      try {
        Resizer.imageFileResizer(
          file,
          1024,
          1024,
          "WEBP",
          90,
          0,
          (uri) => setImageToCrop(uri as File),
          "file",
          512,
          512
        );
      } catch (error) {
        console.error("Error resizing image:", error);
        toast({
          title: "Error processing image",
          description:
            "Failed to resize the image. Please try again with a different image.",
          variant: "destructive",
        });
        resetInput();
      }
    },
    [toast, onGifSelected, resetInput]
  );

  return (
    <>
      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only hidden"
        onChange={(e) => onImageSelected(e.target.files?.[0])}
        ref={fileInputRef}
        type="file"
      />
      <div className="space-y-2">
        <button
          className="group relative block"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Image
            alt="Avatar preview"
            className={cn(
              "size-32 flex-none rounded-full object-cover",
              isUploading && "opacity-50"
            )}
            height={150}
            onError={(e) => {
              (e.target as HTMLImageElement).src = avatarPlaceholder.src;
            }}
            src={avatarSrc}
            unoptimized={
              typeof avatarSrc === "string" &&
              (avatarSrc.endsWith(".gif") || avatarSrc.includes("minio"))
            }
            width={150}
          />
          <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full bg-black/30 text-white transition-colors duration-200 group-hover:bg-black/25">
            {isUploading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Camera size={24} />
            )}
          </span>
        </button>
        <p className="text-muted-foreground text-xs">
          Supports JPG, PNG, and GIF (under 8MB)
        </p>
      </div>

      {gifToCenter && (
        <GifCenteringDialog
          currentValues={{
            displayName: form.getValues("displayName"),
            bio: form.getValues("bio"),
            userId: user.id,
            oldAvatarKey: user.avatarKey || undefined,
          }}
          gifFile={gifToCenter}
          onClose={() => {
            setGifToCenter(undefined);
            resetInput();
          }}
        />
      )}

      {imageToCrop && (
        <CropImageDialog
          cropAspectRatio={1}
          onClose={() => {
            setImageToCrop(undefined);
            resetInput();
          }}
          onCropped={(blob) => {
            if (blob) {
              onImageCropped(blob);
            }
          }}
          src={URL.createObjectURL(imageToCrop)}
        />
      )}
    </>
  );
}
