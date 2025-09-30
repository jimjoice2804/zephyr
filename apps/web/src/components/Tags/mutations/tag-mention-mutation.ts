import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostData, TagWithCount, UserData } from "@zephyr/db";
import { useSession } from "@/app/(main)/SessionProvider";
import { updatePostInCaches } from "./cache-utils";

interface TagsMutationContext {
  previousPost: PostData | undefined;
}

interface MentionsMutationContext {
  previousPost: PostData | undefined;
}

export function useUpdateTagsMutation(postId?: string) {
  const queryClient = useQueryClient();

  return useMutation<PostData, Error, string[], TagsMutationContext>({
    mutationFn: async (tags) => {
      const response = await fetch(`/api/posts/${postId}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      });
      if (!response.ok) {
        throw new Error("Failed to update tags");
      }
      return response.json();
    },
    onMutate: async (newTags) => {
      if (!postId) {
        return { previousPost: undefined };
      }

      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previousPost = queryClient.getQueryData<PostData>(["post", postId]);
      const optimisticTags: TagWithCount[] = newTags.map((name) => ({
        id: name,
        name,
        _count: { posts: 1 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      updatePostInCaches(queryClient, postId, (post) => ({
        ...post,
        tags: optimisticTags,
      }));

      return { previousPost };
    },
    onError: (_, __, context) => {
      if (postId && context?.previousPost) {
        updatePostInCaches(
          queryClient,
          postId,
          () => context.previousPost as PostData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      queryClient.invalidateQueries({ queryKey: ["popularTags"] });
    },
  });
}

export function useUpdateMentionsMutation(postId?: string) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useSession();

  return useMutation<PostData, Error, string[], MentionsMutationContext>({
    mutationFn: async (userIds) => {
      const filteredUserIds = currentUser
        ? userIds.filter((id) => id !== currentUser.id)
        : userIds;

      const response = await fetch(`/api/posts/${postId}/mentions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: filteredUserIds }),
      });
      if (!response.ok) {
        throw new Error("Failed to update mentions");
      }
      return response.json();
    },
    onMutate: async (newUserIds) => {
      if (!postId) {
        return { previousPost: undefined };
      }

      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      const previousPost = queryClient.getQueryData<PostData>(["post", postId]);

      const filteredUserIds = currentUser
        ? newUserIds.filter((id) => id !== currentUser.id)
        : newUserIds;

      const users = filteredUserIds
        .map((id) => queryClient.getQueryData<UserData>(["user", id]))
        .filter((u): u is UserData => !!u);

      updatePostInCaches(queryClient, postId, (post) => ({
        ...post,
        mentions: users.map((user) => ({
          id: `${postId}-${user.id}`,
          postId,
          userId: user.id,
          user,
          createdAt: new Date(),
        })),
      }));

      return { previousPost };
    },
    onError: (_, __, context) => {
      if (postId && context?.previousPost) {
        updatePostInCaches(
          queryClient,
          postId,
          () => context.previousPost as PostData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      queryClient.invalidateQueries({ queryKey: ["mentions"] });
    },
  });
}
