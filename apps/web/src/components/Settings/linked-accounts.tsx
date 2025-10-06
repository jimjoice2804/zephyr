import type { UserData } from "@zephyr/db";
import { useToast } from "@zephyr/ui/hooks/use-toast";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { LoadingButton } from "@/components/Auth/loading-button";

type LinkedAccountsProps = {
  user: UserData;
  onLink: (provider: string) => void;
};

const getStatusText = (isComingSoon: boolean, isConnected?: boolean) => {
  if (isComingSoon) {
    return "Coming Soon";
  }
  return isConnected ? "Connected" : "Not connected";
};

const getButtonText = (isComingSoon: boolean, isConnected?: boolean) => {
  if (isComingSoon) {
    return "Coming Soon";
  }
  return isConnected ? "Disconnect" : "Connect";
};

type AccountCardProps = {
  provider: string;
  icon: string;
  isConnected?: boolean;
  isComingSoon?: boolean;
  isLoading?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
};

const AccountCard = ({
  provider,
  icon,
  isConnected,
  isComingSoon = false,
  isLoading = false,
  onConnect,
  onDisconnect,
}: AccountCardProps) => (
  <motion.div
    className={`group relative overflow-hidden rounded-lg border border-border/50 p-4 backdrop-blur-xs transition-colors ${
      isComingSoon ? "opacity-50" : ""
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-background/50 p-2">
          <Image
            alt={provider}
            className="size-6"
            height={24}
            src={`/socials/${icon}.svg`}
            width={24}
          />
        </div>
        <div>
          <p className="font-medium">{provider}</p>
          <p className="text-muted-foreground text-xs">
            {getStatusText(isComingSoon, isConnected)}
          </p>
        </div>
      </div>
      <LoadingButton
        disabled={isComingSoon}
        loading={isLoading}
        onClick={isConnected ? onDisconnect : onConnect}
        size="sm"
        variant={isConnected ? "destructive" : "default"}
      >
        {getButtonText(isComingSoon, isConnected)}
      </LoadingButton>
    </div>
    <div className="-z-10 absolute inset-0 animate-gradient bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
  </motion.div>
);

export default function LinkedAccounts({ user, onLink }: LinkedAccountsProps) {
  const { toast } = useToast();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLink = (provider: string) => {
    setLoadingProvider(provider);
    onLink(provider);
  };

  const handleUnlink = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      const response = await fetch(`/api/auth/unlink/${provider}`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unlink account");
      }

      toast({
        title: "Account unlinked",
        description: `Your ${provider} account has been unlinked successfully`,
      });

      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="space-y-4"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <h3 className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-medium text-transparent">
          Linked Accounts
        </h3>
      </div>
      <motion.div className="grid gap-4 sm:grid-cols-2">
        <AccountCard
          icon="google"
          isConnected={!!user.googleId}
          isLoading={loadingProvider === "google"}
          onConnect={() => handleLink("google")}
          onDisconnect={() => handleUnlink("google")}
          provider="Google"
        />
        <AccountCard
          icon="github"
          isConnected={!!user.githubId}
          isLoading={loadingProvider === "github"}
          onConnect={() => handleLink("github")}
          onDisconnect={() => handleUnlink("github")}
          provider="GitHub"
        />
        <AccountCard
          icon="discord"
          isConnected={!!user.discordId}
          isLoading={loadingProvider === "discord"}
          onConnect={() => handleLink("discord")}
          onDisconnect={() => handleUnlink("discord")}
          provider="Discord"
        />
        <AccountCard
          icon="twitter"
          isConnected={!!user.twitterId}
          isLoading={loadingProvider === "twitter"}
          onConnect={() => handleLink("twitter")}
          onDisconnect={() => handleUnlink("twitter")}
          provider="Twitter"
        />
      </motion.div>
    </motion.div>
  );
}
