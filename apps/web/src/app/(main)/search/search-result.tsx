"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { PostsPage } from "@zephyr/db";
import { Alert, AlertDescription } from "@zephyr/ui/shadui/alert";
import { Separator } from "@zephyr/ui/shadui/separator";
import { motion } from "framer-motion";
import { FileText, Search } from "lucide-react";
import Post from "@/components/Home/feedview/post-card";
import InfiniteScrollContainer from "@/components/Layouts/infinite-scroll-container";
import LoadMoreSkeleton from "@/components/Layouts/skeletons/load-more-skeleton";
import PostsLoadingSkeleton from "@/components/Layouts/skeletons/post-only-loading-skeleton";
import kyInstance from "@/lib/ky";
import UserSearchResults from "./user-search-result";

type SearchResultsProps = {
  query: string;
};

export default function SearchResults({ query }: SearchResultsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["post-feed", "search", query],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search", {
          searchParams: {
            q: query,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    gcTime: 0,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          An error occurred while loading search results.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "success" && !posts.length) {
    return (
      <div className="space-y-8">
        <UserSearchResults query={query} />
        {status === "success" && (
          <div className="py-8 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No posts found matching "{query}"
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UserSearchResults query={query} />

      {posts.length > 0 && (
        <>
          <Separator className="my-8" />

          <section>
            <div className="mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-xl">Posts</h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-sm">
                {posts.length} results
              </span>
            </div>

            <InfiniteScrollContainer
              className="space-y-5"
              onBottomReached={() =>
                hasNextPage && !isFetching && fetchNextPage()
              }
            >
              {posts.map((post) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border bg-card transition-colors hover:bg-muted"
                  initial={{ opacity: 0, y: 20 }}
                  // @ts-expect-error
                  key={post.id}
                >
                  <Post post={post} />
                </motion.div>
              ))}
              {isFetchingNextPage && <LoadMoreSkeleton />}
            </InfiniteScrollContainer>
          </section>
        </>
      )}
    </div>
  );
}
