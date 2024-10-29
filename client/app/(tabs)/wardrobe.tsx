import UploadButton from "@/ui/UploadButton";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { fetchAllImageUrls } from "@/api/FetchImageUrl";
import { router } from "expo-router";
import { Item, TableTypes } from "@/types";
import Feed from "@/components/Feeds/Feed";
import LookFeed from "@/components/Feeds/LookFeed";
import ImageGallery from "@/components/ImageGallery";
import { useSession } from "@/contexts/SessionContext";

const { height } = Dimensions.get("window");

const tabs = [
  { name: "Items", tableName: "items" },
  { name: "Outfits", tableName: "outfits" },
  { name: "Looks", tableName: "looks" },
];

export default function WardrobeScreen() {
  const { session } = useSession();
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  function onPlusButtonClick() {
    if (tabs[tabIndex]["tableName"] === "items") {
      router.push("/wardrobe/new/item");
    } else if (tabs[tabIndex]["tableName"] === "outfits") {
      router.push("/wardrobe/new/outfit");
    } else if (tabs[tabIndex]["tableName"] === "looks") {
      router.push("/wardrobe/new/look");
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      let items: any[] = [];
      try {
        if (!session) {
          return;
        }
        items = await fetchAllImageUrls(
          tabs[tabIndex]["tableName"] as keyof TableTypes,
          session
        );
      } catch (error: any) {
        console.error("Error fetching items:", error.message);
        setData([]);
        return;
      }
      setData(items);
    };

    fetchItems();
  }, [tabIndex]);

  if (selectedImageIndex !== null) {
    return (
      <ImageGallery
        loading={false}
        data={data.map((object) => object.image_url)}
        selectedImageIndex={selectedImageIndex}
        onClose={() => {
          setSelectedImageIndex(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Tabs */}
      <View style={styles.container}>
        {tabs.map((item, index) => {
          const isActive = index === tabIndex;
          return (
            <TouchableWithoutFeedback
              key={item.name}
              onPress={() => setTabIndex(index)}
            >
              <View style={[styles.item, isActive && styles.activeItem]}>
                <Text style={[styles.text, isActive && styles.activeText]}>
                  {item.name}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>

      {/* Feeds */}
      {tabs[tabIndex]["tableName"] === "looks" ? (
        <LookFeed
          onLookClick={(look: any, index: number) => {
            router.push(`/wardrobe/view/look-outfits/${look.id}`);
          }}
          tableName={tabs[tabIndex]["tableName"] as keyof TableTypes}
        />
      ) : (
        <Feed
          onObjectClick={(item: Item, index: number) => {
            setSelectedImageIndex(index);
          }}
          tableName={tabs[tabIndex]["tableName"] as keyof TableTypes}
        />
      )}

      {/* Upload Button */}
      <UploadButton onPress={onPlusButtonClick} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: "space-around",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
    borderRadius: 8,
    width: 100, // Fixed width for each tab
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280", // Neutral gray for inactive text
  },
  activeItem: {
    backgroundColor: "#EAE6E5", // Light purple background for active tab
    borderRadius: 8,
  },
  activeText: {
    color: "#0f0f0f", // Deep indigo for active tab text
  },
  scrollContainer: {
    flexGrow: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8, // Adds spacing around the gallery
  },
  image: {
    width: "32.5%", // Provides margin between images
    height: height / 7,
    margin: 2, // Space between images
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb", // Light gray border to separate images
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
