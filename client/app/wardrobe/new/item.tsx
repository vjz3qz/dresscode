import React, { useEffect, useState } from "react";
import Camera from "@/components/Camera";
import { fetchImageUrl } from "@/api/FetchImageUrl";
import { router } from "expo-router";
import ImageGallery from "@/components/ImageGallery";

export default function WardrobeScreen() {
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
        const fetchedImageUrl = await fetchImageUrl(imageName);
        setImageUrl(fetchedImageUrl);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImageUrl();
  }, [imageName]);

  if (cameraOpen) {
    return (
      <Camera
        exitCamera={() => {
          router.dismiss();
        }}
        setImageName={setImageName}
      />
    );
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
