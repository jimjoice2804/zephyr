import { github, validateRequest } from "@zephyr/auth/auth";
import { generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
	const { user } = await validateRequest();
	if (!user) {
		// biome-ignore lint/style/noNonNullAssertion: This is a valid use case
		return Response.redirect(new URL("/login", process.env.NEXT_PUBLIC_URL!));
	}

	const state = generateState();
	const cookieStore = await cookies();

	cookieStore.set("state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax",
	});

	cookieStore.set("linking", "true", {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax",
	});

	const url = await github.createAuthorizationURL(state, [
		"read:user",
		"user:email",
	]);

	return Response.redirect(url);
}
