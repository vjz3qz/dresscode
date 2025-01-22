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

  useEffect(() => {
    let isMounted = true;

    const fetchAndSetSession = async () => {
      try {
        setLoading(true);
        const fetchedSession = await fetchSession();
        if (!isMounted) return; // in case the component unmounted
        setSession(fetchedSession ?? null);

        if (fetchedSession) {
          await fetchProfile(fetchedSession);
        }
      } catch (error) {
        console.error("Session fetch error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAndSetSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await fetchProfile(session);
        }
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
      // setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
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
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
