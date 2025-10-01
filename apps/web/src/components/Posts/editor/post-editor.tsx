"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Wind } from "lucide-react";
import { type ClipboardEvent, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/Auth/LoadingButton";
import UserAvatar from "@/components/Layouts/UserAvatar";
import { cn } from "@/lib/utils";
import { useSubmitPostMutation } from "@/posts/editor/mutations";
import { AttachmentPreview } from "./AttachmentPreview";
import { FileInput } from "./FileInput";
import "./styles.css";
import { useQuery } from "@tanstack/react-query";
import type { TagWithCount, UserData } from "@zephyr/db";
import { useHNShareStore } from "@zephyr/ui/store/hn-share-store";
import { MentionTags } from "@/components/Tags/MentionTags";
import { Tags } from "@/components/Tags/Tags";
import kyInstance from "@/lib/ky";
import { HNStoryPreview } from "./HNStoryPreview";
import useMediaUpload, { type Attachment } from "./useMediaUpload";

const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: { opacity: 1, y: 0 },
};

const textVariants = {
	animate: {
		opacity: [0.5, 0.8, 0.5],
		x: [0, 2, 0, -2, 0],
		transition: {
			duration: 3,
			ease: "easeInOut",
			repeat: Number.POSITIVE_INFINITY,
		},
	},
};

export default function PostEditor() {
	const { user } = useSession();
	const mutation = useSubmitPostMutation();
	const hnShareStore = useHNShareStore();
	const sharedHNStory = hnShareStore.story;
	const isHNSharing = hnShareStore.isSharing;

	const { data: userData } = useQuery({
		queryKey: ["user", user.id],
		queryFn: () => kyInstance.get(`/api/users/${user.id}`).json<UserData>(),
		initialData: user,
		staleTime: 1000 * 60 * 5,
	});

	const {
		startUpload,
		attachments,
		isUploading,
		uploadProgress,
		removeAttachment,
		reset: resetMediaUploads,
	} = useMediaUpload();

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		// biome-ignore lint/suspicious/noExplicitAny: any
		onDrop: async (acceptedFiles: any[]) => {
			const validFiles = acceptedFiles.filter(
				(file: { type: string }) =>
					file.type.startsWith("image/") || file.type.startsWith("video/"),
			);
			if (validFiles.length) {
				await startUpload(validFiles);
			}
		},
		accept: {
			"image/*": [],
			"video/*": [],
		},
		maxSize: 128 * 1024 * 1024,
	});

	const { onClick, ...rootProps } = getRootProps();

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bold: false,
				italic: false,
			}),
			Placeholder.configure({
				placeholder: "What's crack-a-lackin'?",
			}),
		],
		editorProps: {
			attributes: {
				class: "focus:outline-none",
			},
			handleDOMEvents: {
				focus: () => {
					setIsEditorFocused(true);
					return false;
				},
			},
		},
		immediatelyRender: false,
	});

	const input = editor?.getText({ blockSeparator: "\n" }) || "";
	const [isEditorFocused, setIsEditorFocused] = useState(false);
	const [selectedTags, setSelectedTags] = useState<TagWithCount[]>([]);
	const [selectedMentions, setSelectedMentions] = useState<UserData[]>([]);

	const handleMentionsChange = useCallback((newMentions: UserData[]) => {
		setSelectedMentions(newMentions);
	}, []);

	const handleTagsChange = useCallback((newTags: TagWithCount[]) => {
		const tagsWithCount = newTags.map((tag) => ({
			...tag,
			_count: tag._count || { posts: 0 },
		}));
		setSelectedTags(tagsWithCount);
	}, []);

	useEffect(() => {
		if (isHNSharing && editor) {
			editor.commands.focus();
			editor.commands.setContent(`Sharing: "${sharedHNStory?.title}"`);
			setTimeout(() => {
				editor.commands.selectAll();
			}, 100);
		}
	}, [isHNSharing, sharedHNStory, editor]);

	const onSubmit = useCallback(() => {
		if (!(input.trim() || isHNSharing)) {
			return;
		}

		const payload = {
			content: input.trim(),
			mediaIds: attachments
				.map((a) => a.mediaId)
				.filter((id): id is string => Boolean(id)),
			tags: selectedTags.map((tag) => tag.name.toLowerCase()),
			mentions: selectedMentions.map((mentionedUser) => mentionedUser.id),
			...(isHNSharing && sharedHNStory
				? {
						hnStory: {
							storyId: sharedHNStory.id,
							title: sharedHNStory.title,
							url: sharedHNStory.url,
							by: sharedHNStory.by,
							time: sharedHNStory.time,
							score: sharedHNStory.score,
							descendants: sharedHNStory.descendants,
						},
					}
				: {}),
		};

		if (!(payload.content || isHNSharing)) {
			return;
		}

		mutation.mutate(payload, {
			onSuccess: () => {
				editor?.commands.clearContent();
				resetMediaUploads();
				setSelectedTags([]);
				setSelectedMentions([]);
				setIsEditorFocused(false);
				if (isHNSharing) {
					hnShareStore.clearState();
				}
			},
		});
	}, [
		input,
		attachments,
		selectedTags,
		selectedMentions,
		mutation,
		editor,
		resetMediaUploads,
		isHNSharing,
		sharedHNStory,
		hnShareStore,
	]);

	const onPaste = useCallback(
		(e: ClipboardEvent<HTMLInputElement>) => {
			const files = Array.from(e.clipboardData.items)
				.filter((item) => item.kind === "file")
				.map((item) => item.getAsFile()) as File[];
			startUpload(files);
		},
		[startUpload],
	);

	return (
		<motion.div
			animate="visible"
			className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 transition-shadow duration-300 hover:shadow-lg"
			initial="hidden"
			variants={containerVariants}
		>
			<motion.div className="flex gap-5" variants={itemVariants}>
				<div className="hidden sm:inline">
					<motion.div
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<UserAvatar avatarUrl={userData.avatarUrl} />
					</motion.div>
				</div>
				<div {...rootProps} className="w-full">
					<AnimatePresence>
						{isEditorFocused && (
							<motion.div
								animate={{ opacity: 1, height: "auto" }}
								className="mb-3 space-y-3"
								exit={{ opacity: 0, height: 0 }}
								initial={{ opacity: 0, height: 0 }}
							>
								<Tags
									className="px-1"
									isOwner={true}
									onTagsChange={handleTagsChange}
									postId={undefined}
									tags={selectedTags}
								/>
								<MentionTags
									className="px-1"
									isOwner={true}
									mentions={selectedMentions}
									onMentionsChange={handleMentionsChange}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					<motion.div
						className={cn(
							"relative rounded-2xl transition-all duration-300",
							isDragActive && "ring-2 ring-primary ring-offset-2",
						)}
						variants={itemVariants}
					>
						<EditorContent
							className={cn(
								"max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-[hsl(var(--background-alt))] px-5 py-3 text-foreground",
								"transition-all duration-300 ease-in-out",
								"focus-within:ring-2 focus-within:ring-primary",
								isDragActive && "outline-dashed outline-primary",
							)}
							editor={editor}
							onPaste={onPaste}
						/>
						{isDragActive && (
							<motion.div
								animate={{ opacity: 1 }}
								className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm"
								exit={{ opacity: 0 }}
								initial={{ opacity: 0 }}
							>
								<p className="font-medium text-lg text-primary">
									Drop files here
								</p>
							</motion.div>
						)}
						{isHNSharing && sharedHNStory && (
							<div className="mt-3">
								<HNStoryPreview
									onRemoveAction={() => hnShareStore.clearState()}
									story={sharedHNStory}
								/>
							</div>
						)}
					</motion.div>
					<input {...getInputProps()} />
				</div>
			</motion.div>

			<AnimatePresence mode="wait">
				{!!attachments.length && (
					<motion.div
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						initial={{ opacity: 0, height: 0 }}
						layout
						transition={{ duration: 0.3 }}
					>
						<AttachmentPreviews
							attachments={attachments}
							removeAttachment={removeAttachment}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<motion.div
				className="flex items-center justify-between gap-3"
				variants={itemVariants}
			>
				<motion.div
					className="flex items-center justify-between gap-3"
					variants={itemVariants}
				>
					<div className="flex items-center gap-2 text-muted-foreground">
						<Wind className="h-4 w-4 hover:text-primary" />
						<motion.div
							animate="animate"
							className="pointer-events-none font-medium text-xs hover:text-primary"
							variants={textVariants}
						>
							Zephyr
						</motion.div>
					</div>
				</motion.div>

				<div className="flex items-center gap-3">
					<AnimatePresence>
						{isUploading && (
							<motion.div
								animate={{ opacity: 1, x: 0 }}
								className="flex items-center gap-2"
								exit={{ opacity: 0, x: -20 }}
								initial={{ opacity: 0, x: -20 }}
							>
								<span className="font-medium text-sm tabular-nums">
									{(uploadProgress ?? 0).toFixed(1)}%
								</span>
								<Loader2 className="size-5 animate-spin text-primary" />
							</motion.div>
						)}
					</AnimatePresence>
					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<FileInput
							disabled={isUploading || attachments.length >= 5}
							onFilesSelected={startUpload}
						/>
					</motion.div>
					<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
						<LoadingButton
							className="min-w-20 bg-primary text-primary-foreground hover:bg-primary/90"
							disabled={!input.trim() || isUploading}
							loading={mutation.isPending}
							onClick={onSubmit}
						>
							Post
						</LoadingButton>
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	);
}

type AttachmentPreviewsProps = {
	attachments: Attachment[];
	removeAttachment: (fileName: string) => void;
};

function AttachmentPreviews({
	attachments,
	removeAttachment,
}: AttachmentPreviewsProps) {
	return (
		<motion.div
			animate="visible"
			className={cn(
				"flex flex-col gap-3",
				attachments.length > 1 && "sm:grid sm:grid-cols-2",
			)}
			initial="hidden"
			variants={containerVariants}
		>
			{attachments.map((attachment, index) => (
				<motion.div
					animate={{ opacity: 1, scale: 1 }}
					custom={index}
					exit={{ opacity: 0, scale: 0.8 }}
					initial={{ opacity: 0, scale: 0.8 }}
					key={attachment.file.name}
					layoutId={attachment.file.name}
					transition={{
						duration: 0.2,
						layout: { duration: 0.2 },
					}}
					variants={itemVariants}
				>
					<AttachmentPreview
						attachment={attachment}
						onRemoveClick={() => removeAttachment(attachment.file.name)}
					/>
				</motion.div>
			))}
		</motion.div>
	);
}
