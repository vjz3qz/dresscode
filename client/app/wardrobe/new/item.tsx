import React, { useEffect, useState } from "react";
import Camera from "@/components/Camera";
import { fetchImageUrl } from "@/api/FetchImageUrl";
import { router } from "expo-router";
import ImageGallery from "@/components/ImageGallery";
import { useSession } from "@/contexts/SessionContext";
import { saveItem } from "@/api/SaveItem";

export default function WardrobeScreen() {
  const { session } = useSession();
  const [cameraOpen, setCameraOpen] = useState<boolean>(true);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImageUrl = async () => {
      if (!imageName) {
        return;
      }
      try {
        if (session) {
          let fetchedImageUrl = "";
          fetchedImageUrl = await fetchImageUrl(imageName, session);
          setImageUrl(fetchedImageUrl);
        }
      } catch (error) {
        console.error("Error fetching image URL:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImageUrl();
  }, [imageName]);

  async function uploadPicture(photoUri: string) {
    if (photoUri) {
      try {
        const item = { name: "", type: "clothing" };
        const createdItems = await saveItem(item, photoUri);

        if (createdItems && createdItems.length > 0) {
          setImageName(createdItems[0].name || "");
        }
      } catch (error) {
        console.error("Error saving the item:", error);
      }
      router.dismiss();
    }
  }

  if (cameraOpen) {
    if (cameraOpen) {
      return <Camera uploadPicture={uploadPicture} />;
    }
  }
  if (imageName) {
    return (
      <ImageGallery
        loading={loading}
        data={[imageUrl]}
        selectedImageIndex={0}
        onClose={() => {
          router.dismiss();
        }}
      />
    );
  }
}
