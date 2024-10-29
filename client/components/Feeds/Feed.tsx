import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { fetchAllImageUrls } from "@/api/FetchImageUrl";
import { TableTypes } from "@/types";
import { useSession } from "@/contexts/SessionContext";

const { height, width } = Dimensions.get("window");

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObjects = async () => {
      setLoading(true);
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
        console.error("Error fetching items:", error.message);
        setData([]);
        return;
      }
      setData(objects);
      setLoading(false);
    };

    if (rawData) {
      setData(rawData);
      setLoading(false);
    } else {
      fetchObjects();
    }
  }, [tableName, rawData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b7280" />
      </View>
    );
  }

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
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image_url }} style={styles.image} />
            </View>
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
    paddingVertical: 10,
  },
  imageContainer: {
    width: width / 3 - 10, // Divide width into 3 with spacing
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  image: {
    width: "100%",
    height: height / 6,
    resizeMode: "cover",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
