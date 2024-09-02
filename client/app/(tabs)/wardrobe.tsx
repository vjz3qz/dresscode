import UploadButton from "@/ui/UploadButton";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import Gallery from "react-native-awesome-gallery";
import Camera from "@/components/Camera";
import ImageViewer from "@/components/ImageViewer";
import { supabase } from "@/utils/Supabase";
import axios from "axios";

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
  }, [value]);

  return cameraOpen ? (
    <Camera
      exitCamera={() => setCameraOpen(false)}
      setImageName={setImageName}
    />
  ) : imageName ? (
    <ImageViewer imageName={imageName} />
  ) : (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {tabs.map((item, index) => {
          const isActive = index === value;

          return (
            <View key={item.name} style={{ flex: 1 }}>
              <TouchableWithoutFeedback
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
            </View>
          );
        })}
      </View>

      <Gallery
        data={data}
        // onIndexChange={(newIndex) => {
        //   // console.log("newIndex", newIndex);
        // }}
      />
      <UploadButton onPress={() => setCameraOpen(true)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 24,
    paddingHorizontal: 12,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
    borderRadius: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
});
