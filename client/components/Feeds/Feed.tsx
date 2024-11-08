import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);

  // Set a cache expiry time in milliseconds (e.g., 1 hour)
  const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour

  const fetchAndCacheData = useCallback(
    async (isRefreshing = false) => {
      if (!session) return;

      if (!isRefreshing) setLoading(true);
      const cacheKey = `image_urls_${tableName}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData && !isRefreshing) {
        const parsedData = JSON.parse(cachedData);
        const { timestamp, objects } = parsedData;

        // Check if cached data is still valid
        if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
          setData(objects);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Fetch new data if cache is expired or doesn't exist
      try {
        const objects = await fetchAllImageUrls(tableName, session);
        setData(objects);

        // Cache the data with a new timestamp
        AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), objects })
        );
      } catch (error: any) {
        console.error("Error fetching items:", error.message);
        setData([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tableName, session]
  );

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAndCacheData(true);
  }, [fetchAndCacheData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b7280" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
