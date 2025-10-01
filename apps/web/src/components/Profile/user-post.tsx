"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { PostsPage } from "@zephyr/db";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import Post from "@/components/Home/feedview/postCard";
import InfiniteScrollContainer from "@/components/Layouts/InfiniteScrollContainer";
import PostsOnlyLoadingSkeleton from "@/components/Layouts/skeletons/PostOnlyLoadingSkeleton";
import kyInstance from "@/lib/ky";

type UserPostsProps = {
  userId: string;
  filter?: "all" | "scribbles" | "snapshots" | "media" | "files";
};

const UserPosts: React.FC<UserPostsProps> = ({ userId, filter = "all" }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "user-posts", userId, filter],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/users/${userId}/posts`,
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60, // 1 minute stale time to reduce refetches
  });

  const filteredPosts = useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.posts) || [];

    switch (filter) {
      case "scribbles":
        return allPosts.filter((post) => post.attachments.length === 0);
      case "snapshots":
        return allPosts.filter((post) =>
          post.attachments.some((att) => att.type === "IMAGE")
        );
      case "media":
        return allPosts.filter((post) =>
          post.attachments.some(
            (att) => att.type === "VIDEO" || att.type === "AUDIO"
          )
        );
      case "files":
        return allPosts.filter((post) =>
          post.attachments.some(
            (att) => att.type === "DOCUMENT" || att.type === "CODE"
          )
        );
      default:
        return allPosts;
    }
  }, [data?.pages, filter]);

  if (status === "pending") {
    return <PostsOnlyLoadingSkeleton />;
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }

  if (status === "success" && !filteredPosts.length) {
    return (
      <p className="text-center text-muted-foreground">
        {filter === "all"
          ? "This user hasn't posted anything yet."
          : `No ${filter} available.`}
      </p>
    );
  }

  // Using a memoized post renderer to prevent unnecessary re-renders
  const MemoizedPost = React.memo(Post);

  return (
    <div className="space-y-4">
      <InfiniteScrollContainer
        className="space-y-5"
        onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      >
        {filteredPosts.map((post) => (
          <MemoizedPost key={post.id} post={post} />
        ))}
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-primary" />
          </div>
        )}
      </InfiniteScrollContainer>
    </div>
  );
};

export default React.memo(UserPosts);
