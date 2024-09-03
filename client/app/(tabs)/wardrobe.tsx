import UploadButton from "@/ui/UploadButton";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Gallery from "react-native-awesome-gallery";
import Camera from "@/components/Camera";
import ImageViewer from "@/components/ImageViewer";
import { supabase } from "@/utils/Supabase";
import axios from "axios";
import { Image } from "expo-image";

const { height } = Dimensions.get("window");

// const images = [
//   "https://picsum.photos/id/1015/600/400",
//   "https://picsum.photos/id/1025/600/400",
//   "https://picsum.photos/id/1035/600/400",
//   "https://picsum.photos/id/1045/600/400",
//   "https://picsum.photos/id/1055/600/400",
//   "https://picsum.photos/id/1065/600/400",
//   "https://picsum.photos/id/1075/600/400",
//   "https://picsum.photos/id/1076/600/400",
//   "https://picsum.photos/id/1077/600/400",
//   "https://picsum.photos/id/1078/600/400",
// ];

const tabs = [
  { name: "Items", tableName: "items" },
  { name: "Outfits", tableName: "outfits" },
  { name: "Looks", tableName: "looks" },
];

export default function WardrobeScreen() {
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [imageName, setImageName] = useState<string | null>(null);
  const [value, setValue] = useState(0);
  const [data, setData] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const fetchImageUrl = async (imageName: string) => {
    if (!imageName) {
      return;
    }

    try {
      const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await axios.get(
        `${BACKEND_URL}/get-image-url/${imageName}`
      );

      return response.data["result"]["url"];
    } catch (error) {
      console.error("Error fetching image URL:", error);
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      let { data, error } = await supabase
        .from(tabs[value]["tableName"])
        .select("*");

      if (error) {
        console.error("Error fetching items:", error.message);
        setData([]);
        return;
      }
      if (!data || data.length === 0) {
        return;
      }
      let items: string[] = [];
      for (let i = 0; i < data.length; i++) {
        if (!data[i]["s3_key"]) {
          continue;
        }
        const imageUrl = await fetchImageUrl(data[i]["s3_key"]);
        items.push(imageUrl);
      }
      setData(items);
      console.log("items", items);
    };

    fetchItems();
  }, [value, imageName, cameraOpen]);

  if (selectedImageIndex !== null) {
    return (
      <View style={{ flex: 1 }}>
        {/* X button to close the gallery */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setSelectedImageIndex(null)}
        >
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
        <Gallery initialIndex={selectedImageIndex} data={data} />
      </View>
    );
  }

  return cameraOpen ? (
    <Camera
      exitCamera={() => setCameraOpen(false)}
      setImageName={setImageName}
    />
  ) : imageName ? (
    <ImageViewer imageName={imageName} setImageName={setImageName} />
  ) : (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.container]}>
        {tabs.map((item, index) => {
          const isActive = index === value;

          return (
            <TouchableWithoutFeedback
              key={item.name}
              onPress={() => {
                setValue(index);
              }}
            >
              <View
                style={[
                  styles.item,
                  isActive && { backgroundColor: "#e0e7ff" },
                ]}
              >
                <Text style={[styles.text, isActive && { color: "#4338ca" }]}>
                  {item.name}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.gridContainer}>
          {data.map((uri, index) => (
            <TouchableWithoutFeedback
              key={uri}
              onPress={() => setSelectedImageIndex(index)}
            >
              <Image source={uri} style={styles.image} />
            </TouchableWithoutFeedback>
          ))}
        </View>
      </ScrollView>
      <UploadButton onPress={() => setCameraOpen(true)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 24,
    paddingHorizontal: 12,
    justifyContent: "space-around",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
    borderRadius: 6,
    width: 100, // Fixed width for each tab
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  debugBorder: {
    borderWidth: 1,
    borderColor: "red",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gridContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  image: {
    width: "33.33333333333333333333333%",
    height: height / 7,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
