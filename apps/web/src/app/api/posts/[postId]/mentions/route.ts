import { NotificationType } from "@prisma/client";
import { prisma } from "@zephyr/db";
import { getSessionFromApi } from "@/lib/session";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ postId: string }> }
) {
  const session = await getSessionFromApi();
  const user = session?.user;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId } = await ctx.params;
  const mentions = await prisma.mention.findMany({
    where: { postId },
  });
  return Response.json(mentions);
}

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { user } = await getSessionFromApi();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userIds } = await request.json();

    const filteredUserIds = Array.isArray(userIds)
      ? userIds.filter((id) => id !== user.id)
      : [];

    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      select: { userId: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.mention.deleteMany({
        where: { postId: params.postId },
      });

      const mentionPromises = filteredUserIds.map((userId: string) =>
        tx.mention.create({
          data: {
            postId: params.postId,
            userId,
          },
        })
      );

      const notificationPromises = filteredUserIds.map((userId: string) =>
        tx.notification.create({
          data: {
            type: NotificationType.MENTION,
            recipientId: userId,
            issuerId: user.id,
            postId: params.postId,
          },
        })
      );

      await Promise.all([...mentionPromises, ...notificationPromises]);
    });

    const updatedMentions = await prisma.mention.findMany({
      where: {
        postId: params.postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return Response.json({ mentions: updatedMentions.map((m) => m.user) });
  } catch (error) {
    console.error("Error updating mentions:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
