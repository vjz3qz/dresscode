// FollowContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Profile } from "@/types";
import { fetchFollowingProfiles } from "@/api/fetchFollows";
import { fetchSuggestedProfiles } from "@/api/fetchProfiles";
import { handleFollow, handleUnfollow } from "@/api/handleFollows";
import { useSession } from "@/contexts/SessionContext";

type FollowContextType = {
  followingState: { [key: string]: boolean };
  followingProfiles: Profile[];
  suggestedProfiles: Profile[];
  popularProfiles: Profile[];
  toggleFollow: (profileId: string) => Promise<void>;
  refreshFollowData: () => Promise<void>;
};

const FollowContext = createContext<FollowContextType | undefined>(undefined);

interface FollowProviderProps {
  children: React.ReactNode;
}

export const FollowProvider: React.FC<FollowProviderProps> = ({ children }) => {
  const { session } = useSession();
  const [followingState, setFollowingState] = useState<{
    [key: string]: boolean;
  }>({});
  const [suggestedProfiles, setSuggestedProfiles] = useState<Profile[]>([]);
  const [popularProfiles, setPopularProfiles] = useState<Profile[]>([]);
  const [followingProfiles, setFollowingProfiles] = useState<Profile[]>([]);

  const refreshFollowData = useCallback(async () => {
    if (!session || !session.user.id) return;
    try {
      // Fetch suggested profiles
      const suggested = await fetchSuggestedProfiles();
      setSuggestedProfiles(suggested);

      // For demo purposes, popular profiles are the reverse of suggested
      setPopularProfiles([...suggested].reverse());

      // Fetch profiles the user is following
      const following = await fetchFollowingProfiles(session.user.id);
      setFollowingProfiles(following);

      // Build a mapping of profile id to follow state
      const followState: { [key: string]: boolean } = {};
      [...suggested, ...following].forEach((profile) => {
        followState[profile.id ?? ""] = following.some(
          (p) => p.id === profile.id
        );
      });
      setFollowingState(followState);
    } catch (error) {
      console.error("Error fetching follow data:", error);
    }
  }, [session]);

  useEffect(() => {
    refreshFollowData();
  }, [refreshFollowData]);

  const toggleFollow = async (profileId: string) => {
    if (!session || !session.user.id) return;
    try {
      if (followingState[profileId]) {
        // If already following, unfollow
        await handleUnfollow(session.user.id, profileId);
        setFollowingProfiles((prev) => prev.filter((p) => p.id !== profileId));
      } else {
        // Otherwise, follow
        await handleFollow(session.user.id, profileId);
        // Try to find the profile from suggested or popular lists
        const profileToAdd = [...suggestedProfiles, ...popularProfiles].find(
          (p) => p.id === profileId
        );
        if (
          profileToAdd &&
          !followingProfiles.some((p) => p.id === profileId)
        ) {
          setFollowingProfiles((prev) => [...prev, profileToAdd]);
        }
      }
      // Toggle the follow state
      setFollowingState((prev) => ({
        ...prev,
        [profileId]: !prev[profileId],
      }));
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <FollowContext.Provider
      value={{
        followingState,
        followingProfiles,
        suggestedProfiles,
        popularProfiles,
        toggleFollow,
        refreshFollowData,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = (): FollowContextType => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useFollow must be used within a FollowProvider");
  }
  return context;
};
