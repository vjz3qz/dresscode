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
import { fetchAllImageUrls } from "@/api/FetchImageUrl";
import { TableTypes } from "@/types";
import { useSession } from "@/contexts/SessionContext";

const { height } = Dimensions.get("window");

export default function Feed({
  onObjectClick,
  tableName,
  rawData,
}: {
  onObjectClick: (object: any, index: number) => void;
  tableName: keyof TableTypes;
  rawData?: any[];
}) {
  const { session } = useSession();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchObjects = async () => {
      let objects: any[] = [];
      try {
        if (tableName) {
          if (!session) {
            return;
          }
          objects = await fetchAllImageUrls(tableName, session);
        } else {
          console.error("tableName is undefined");
        }
      } catch (error: any) {
        // Error: Cannot find name 'error'.
        console.error("Error fetching items:", error.message);
        setData([]);
        return;
      }
      setData(objects);
    };

    if (rawData) {
      setData(rawData);
    } else {
      fetchObjects();
    }
  }, [tableName, rawData]);

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
            onPress={() => onObjectClick(data[index], index)}
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
