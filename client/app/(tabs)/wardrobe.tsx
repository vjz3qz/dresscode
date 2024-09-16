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

const { height } = Dimensions.get("window");

const tabs = [
  { name: "Items", tableName: "items" },
  { name: "Outfits", tableName: "outfits" },
  { name: "Looks", tableName: "looks" },
];

export default function WardrobeScreen() {
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
        items = await fetchAllImageUrls(
          tabs[tabIndex]["tableName"] as keyof TableTypes
        );
      } catch (error: any) {
        // Error: Cannot find name 'error'.
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
      <View style={[styles.container]}>
        {tabs.map((item, index) => {
          const isActive = index === tabIndex;

          return (
            <TouchableWithoutFeedback
              key={item.name}
              onPress={() => {
                setTabIndex(index);
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
      {tabs[tabIndex]["tableName"] === "looks" ? (
        <LookFeed
          onLookClick={(look: any, index: number) => {
            // console.log("Look clicked:", look, index);
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
      <UploadButton onPress={onPlusButtonClick} />
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
    flexDirection: "row",
    flexWrap: "wrap",
  },
  image: {
    width: "33.33333333333333333333333%",
    height: height / 7,
    borderWidth: 0.5,
    // borderRightWidth: 0,
    // borderBottomWidth: 1,
    // borderTopWidth: 1,
    // borderLeftWidth: 0,

    borderColor: "white",
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
