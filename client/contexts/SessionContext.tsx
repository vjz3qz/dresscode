import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/utils/Supabase";
import { Session } from "@supabase/supabase-js";

// Create the SessionContext with the correct type
type SessionContextType = {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
};

// Initialize the context with default values
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Create a custom hook to use the SessionContext
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

// Create the SessionProvider component
export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Clean up the listener on unmount
    return () => {
      authListener.subscription?.unsubscribe(); // Ensure `unsubscribe` is properly handled
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};
