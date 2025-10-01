import CommentSkeleton from "./CommentSkeleton";

const CommentsSkeleton = () => (
  <div className="mt-4 space-y-3">
    <div className="rounded-lg border border-border p-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-24 animate-pulse rounded-md bg-muted" />
          <div className="mt-3 flex justify-between">
            <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-center">
      <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
    </div>

    <div className="divide-y">
      {["comment-1", "comment-2", "comment-3"].map((id) => (
        <CommentSkeleton key={id} />
      ))}
    </div>
  </div>
);

export default CommentsSkeleton;
