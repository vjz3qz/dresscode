import React, { useState } from "react";
import Camera from "@/components/Camera";
import ImageViewer from "@/components/ImageViewer";

export default function WardrobeScreen() {
  const [cameraOpen, setCameraOpen] = useState<boolean>(true);
  const [imageName, setImageName] = useState<string | null>(null);

  if (cameraOpen) {
    return (
      <Camera
        exitCamera={() => setCameraOpen(false)}
        setImageName={setImageName}
      />
    );
  }
  if (imageName) {
    return <ImageViewer imageName={imageName} setImageName={setImageName} />;
  }
}
