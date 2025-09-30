"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@zephyr/ui/shadui/avatar";
import { Card, CardContent } from "@zephyr/ui/shadui/card";
import type React from "react";

interface FriendsProps {
  friends: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
}

const Friends: React.FC<FriendsProps> = ({ friends }) => (
  <Card className="mb-6 bg-card text-card-foreground">
    <CardContent className="p-6">
      <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase">
        Friends
      </h2>
      <div className="space-y-4">
        {friends.map((friend, index) => (
          <div className="flex items-center space-x-3" key={index}>
            <Avatar>
              <AvatarImage
                alt={friend.name}
                height={40}
                src={friend.avatar}
                width={40}
              />
              <AvatarFallback>{friend.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{friend.name}</p>
              <p className="text-muted-foreground text-xs">{friend.role}</p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default Friends;
