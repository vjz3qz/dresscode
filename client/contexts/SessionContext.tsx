import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/Supabase";
import { Session } from "@supabase/supabase-js";
import { fetchSession } from "@/utils/FetchSession";

type SessionContextType = {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  username: string;
  avatarUrl: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setAvatarUrl: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  profileNotFound: boolean;
};

// Initialize the context with default values
const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileNotFound, setProfileNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAndSetSession = async () => {
      try {
        setLoading(true);
        const session = await fetchSession();
        if (!isMounted) return;

        setSession(session ?? null);
        if (session) await fetchProfile(session);
      } catch (error) {
        console.error("Session fetch error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAndSetSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        if (session) await fetchProfile(session);
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch Profile Data
  const fetchProfile = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile not found case
          setProfileNotFound(true);
        } else throw error;
      }

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
        setProfileNotFound(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        username,
        setUsername,
        avatarUrl,
        setAvatarUrl,
        loading,
        profileNotFound,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
