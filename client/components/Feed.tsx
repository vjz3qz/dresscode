import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { fetchAllItemImageUrls } from "@/api/FetchImageUrl";
import { Item } from "@/types";

const { height } = Dimensions.get("window");

export default function Feed({
  onItemClick,
  tableName,
}: {
  onItemClick: (item: Item) => void;
  tableName: string;
}) {
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      let items: Item[] = [];
      try {
        items = await fetchAllItemImageUrls(tableName);
      } catch (error: any) {
        // Error: Cannot find name 'error'.
        console.error("Error fetching items:", error.message);
        setData([]);
        return;
      }
      setData(items);
    };

    fetchItems();
  }, [tableName]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {data.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 20, color: "#6b7280" }}>
            No {tableName} found. Add some {tableName}!
          </Text>
        </View>
      ) : (
        data.map((item, index) => (
          <TouchableWithoutFeedback
            key={item.id}
            onPress={() => onItemClick(data[index])}
          >
            <Image source={{ uri: item.image_url }} style={styles.image} />
          </TouchableWithoutFeedback>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  image: {
    width: "33.33333333333333333333333%",
    height: height / 7,
    borderWidth: 0.5,

    borderColor: "white",
  },
});
