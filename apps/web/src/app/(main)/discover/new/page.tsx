import type { Metadata } from "next";
import DiscoverySidebar from "@/components/Discover/discover-sidebar";
import NewUsers from "@/components/Discover/new-users";
import Friends from "@/components/Home/sidebars/left/friends";
import { getUserData } from "@/hooks/use-user-data";
import { authClient } from "@/lib/auth";

export const metadata: Metadata = {
  title: "New Users",
  description: "Discover new users on Zephyr",
};

export default async function NewUsersPage() {
  const session = await authClient.getSession();
  const userData = session?.user ? await getUserData(session.user.id) : null;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <aside className="sticky top-[5rem] mt-5 ml-1 hidden h-[calc(100vh-5.25rem)] w-72 shrink-0 md:block">
        <div className="flex h-full flex-col">
          <DiscoverySidebar />
          <div className="mt-2 flex-none">
            <Friends isCollapsed={false} />
          </div>
        </div>
      </aside>

      <div className="mt-5 mr-4 mb-14 ml-4 w-full min-w-0 space-y-5 md:mr-0 md:mb-0 md:ml-0">
        <NewUsers userId={userData?.id} />
      </div>
    </main>
  );
}
