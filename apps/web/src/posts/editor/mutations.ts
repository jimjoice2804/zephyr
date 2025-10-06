import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { PostsPage } from "@zephyr/db";
import { useToast } from "@zephyr/ui/hooks/use-toast";
import { submitPost, updatePostMentions } from "./actions";

type PostInput = {
  content: string;
  mediaIds: string[];
  tags: string[];
  mentions: string[];
  hnStory?: {
    storyId: number;
    title: string;
    url?: string;
    by: string;
    time: number;
    score: number;
    descendants: number;
  };
};

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: PostInput) => {
      const payload = {
        content: input.content,
        mediaIds: input.mediaIds || [],
        tags: input.tags || [],
        mentions: Array.isArray(input.mentions)
          ? input.mentions.filter(Boolean)
          : [],
        hnStory: input.hnStory,
      };

      const response = await submitPost(payload);
      if (!response) {
        throw new Error("Failed to create post");
      }
      return response;
    },
    onSuccess: async (newPost) => {
      const queryFilter = { queryKey: ["post-feed", "for-you"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData?.pages[0]) {
            return oldData;
          }

          return {
            pageParams: oldData.pageParams,
            pages: [
              {
                posts: [newPost, ...oldData.pages[0].posts],
                nextCursor: oldData.pages[0].nextCursor,
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["popularTags"] });
      const isHnShare = !!newPost.hnStoryShare;
      toast({
        title: isHnShare
          ? "HN Story shared successfully!"
          : "Post created successfully!",
        description: isHnShare
          ? "Hacker News story has been shared with your thoughts ✨"
          : "Your post is now live ✨",
        duration: 5000,
      });
    },
    onError(error) {
      console.error("Post creation error:", error);
      toast({
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create post. Please try again.",
      });
    },
  });

  return mutation;
}

export function useUpdateMentionsMutation(postId?: string) {
  // No changes needed here
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentions: string[]) => {
      if (!postId) {
        throw new Error("Post ID is required to update mentions");
      }
      const response = await updatePostMentions(postId, mentions);
      if (!response) {
        throw new Error("Failed to update mentions");
      }
      return response;
    },
    onSuccess: (updatedPost) => {
      if (postId) {
        queryClient.setQueryData(["post", postId], updatedPost);
      }
      toast({
        title: "Mentions updated",
        description: "The mentioned users have been notified",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error("Failed to update mentions:", error);
      toast({
        variant: "destructive",
        description: "Failed to update mentions. Please try again.",
      });
    },
  });
}
