import { axiosParamSerializer } from "@/utils/AxiosParamSerializer";
import { fetchSession } from "@/utils/FetchSession";
import { Session } from "@supabase/supabase-js";
import axios from "axios";
import * as FileSystem from "expo-file-system";

export async function removeBackground(key: string) {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const response = await axios.post(
    `${BACKEND_URL}/remove-background`,
    { key }, // This is the data payload
    {
      paramsSerializer: axiosParamSerializer,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (response.status !== 200) {
    throw new Error(`Error uploading screenshot: ${response.statusText}`);
  }

  const result = response.data;

  return result["result"]["file_name"];
}
