import { redis } from "@zephyr/db";

const SUGGESTED_USERS_CACHE_KEY = (userId: string) =>
  `suggested-users:${userId}`;
const CACHE_TTL = 300;

export const suggestedUsersCache = {
  async get(userId: string) {
    try {
      const cached = await redis.get(SUGGESTED_USERS_CACHE_KEY(userId));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error getting suggested users from cache:", error);
      return null;
    }
  },

  async set(userId: string, data: unknown) {
    try {
      await redis.set(
        SUGGESTED_USERS_CACHE_KEY(userId),
        JSON.stringify(data),
        "EX",
        CACHE_TTL
      );
    } catch (error) {
      console.error("Error setting suggested users cache:", error);
    }
  },

  async invalidate(userId: string) {
    try {
      await redis.del(SUGGESTED_USERS_CACHE_KEY(userId));
    } catch (error) {
      console.error("Error invalidating suggested users cache:", error);
    }
  },

  async invalidateAll() {
    try {
      const keys = await redis.keys("suggested-users:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Error invalidating all suggested users caches:", error);
    }
  },

  async invalidateForUser(userId: string) {
    try {
      await Promise.all([
        redis.del(SUGGESTED_USERS_CACHE_KEY(userId)),
        redis.del(`follower-info:${userId}`),
      ]);
    } catch (error) {
      console.error("Error invalidating user caches:", error);
    }
  },
};
