import { Session } from "@supabase/supabase-js";
import axios from "axios";
import * as FileSystem from "expo-file-system";

async function convertUriToFormData(uri: string): Promise<FormData> {
  const fileInfo = await FileSystem.getInfoAsync(uri);

  // Attempt to extract the file extension from the URI
  let fileType = uri.split(".").pop();

  // Fallback to a default type if no extension is found
  if (!fileType || fileType.length > 4) {
    fileType = "jpeg"; // Fallback to jpeg or any appropriate default
  }

  const formData = new FormData();

  // Append the file to the FormData object with a fallback type
  formData.append("file", {
    uri,
    name: `file.${fileType}`, // Provide a default name if needed
    type: `image/${fileType}`, // Use the file type from the URI or fallback
  });

  return formData;
}

export async function uploadImageUri(uri: string, session: Session) {
  const formData = await convertUriToFormData(uri);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  const response = await axios.post(`${BACKEND_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Error uploading screenshot: ${response.statusText}`);
  }

  const result = response.data;

  return result["result"]["filename"];
}
