import React, { useEffect, useState, useCallback } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage"; // for local caching
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

  // Retrieve data from cache or fetch from API if not cached
  const fetchAndCacheData = useCallback(async () => {
    if (!session) return;

    setLoading(true);

    const cacheKey = `image_urls_${tableName}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (cachedData) {
      setData(JSON.parse(cachedData));
      setLoading(false);
    } else {
      try {
        const objects = await fetchAllImageUrls(tableName, session);
        setData(objects);
        AsyncStorage.setItem(cacheKey, JSON.stringify(objects)); // Cache the data
      } catch (error: any) {
        console.error("Error fetching items:", error.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
  }, [tableName, session]);

  // Update feed when tableName or rawData changes, debounce refetching
  useEffect(() => {
    const timer = setTimeout(() => {
      if (rawData) {
        setData(rawData);
        setLoading(false);
      } else {
        fetchAndCacheData();
      }
    }, 300); // 300ms debounce to avoid excessive refetching

    return () => clearTimeout(timer); // Clear timeout on unmount
  }, [tableName, rawData, fetchAndCacheData]);

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
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
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
    width: width / 3 - 10,
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
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 20,
    color: "#6b7280",
  },
});
