import { prisma } from "@zephyr/db";
import { getSessionFromApi } from "@/lib/session";

export async function GET(
  _req: Request,
  props: { params: Promise<{ storyId: string }> }
) {
  const params = await props.params;
  const { storyId } = params;

  try {
    const { user: loggedInUser } = await getSessionFromApi();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmark = await prisma.hNBookmark.findUnique({
      where: {
        userId_storyId: {
          userId: loggedInUser.id,
          storyId: Number.parseInt(storyId, 10),
        },
      },
    });

    return Response.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ storyId: string }> }
) {
  const session = await getSessionFromApi();
  const user = session?.user;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { storyId } = await ctx.params;
  await prisma.hNBookmark.create({
    data: { userId: user.id, storyId: Number(storyId) },
  });
  return Response.json({ success: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ storyId: string }> }
) {
  const session = await getSessionFromApi();
  const user = session?.user;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { storyId } = await ctx.params;
  await prisma.hNBookmark.deleteMany({
    where: { userId: user.id, storyId: Number(storyId) },
  });
  return Response.json({ success: true });
}
