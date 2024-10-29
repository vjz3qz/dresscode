import React from "react";
import Account from "@/components/Account";
import { useSession } from "@/contexts/SessionContext";

export default function ProfileScreen() {
  const { session } = useSession(); // Access session from context
  return session ? <Account /> : null;
}
