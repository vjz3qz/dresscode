import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAllImageUrls } from "@/api/FetchImageUrl";
import { Outfit, TableTypes } from "@/types";
import { useSession } from "@/contexts/SessionContext";

const { height, width } = Dimensions.get("window");

export default function SelectFeed({
  tableName,
  onSelect,
}: {
  tableName: keyof TableTypes;
  onSelect: (selectedOutfits: Outfit[]) => void;
}) {
  const { session } = useSession();
  const [data, setData] = useState<Outfit[]>([]);
  const [selectedOutfits, setSelectedOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);

  const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
  const REFRESH_COOLDOWN = 10000; // Cooldown time in milliseconds (e.g., 10 seconds)

  const fetchAndCacheOutfits = useCallback(
    async (isRefreshing = false) => {
      if (!session) return;

      if (!isRefreshing) setLoading(true);
      const cacheKey = `outfits_${tableName}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData && !isRefreshing) {
        const parsedData = JSON.parse(cachedData);
        const { timestamp, items: cachedItems } = parsedData;

        // Check if cached data is still valid
        if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
          setData(cachedItems);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Fetch new data if cache is expired or doesn't exist
      try {
        const items = (await fetchAllImageUrls(tableName, session)) as Outfit[];
        setData(items);

        // Cache the data with a new timestamp
        AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), items })
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAndCacheOutfits();
    }, 300); // Debounce fetch by 300ms to avoid excessive refetching

    return () => clearTimeout(timer);
  }, [tableName, fetchAndCacheOutfits]);

  const onRefresh = useCallback(() => {
    const now = Date.now();
    if (lastRefreshTime && now - lastRefreshTime < REFRESH_COOLDOWN) {
      // If within cooldown period, do not refresh
      console.log("Refresh is throttled. Please wait before refreshing again.");
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    setLastRefreshTime(now); // Update the last refresh time
    fetchAndCacheOutfits(true);
  }, [fetchAndCacheOutfits, lastRefreshTime]);

  const toggleSelection = (item: Outfit) => {
    const isSelected = selectedOutfits.some(
      (selected) => selected.id === item.id
    );
    const newSelectedOutfits = isSelected
      ? selectedOutfits.filter((selected) => selected.id !== item.id)
      : [...selectedOutfits, item];

    setSelectedOutfits(newSelectedOutfits);
    onSelect(newSelectedOutfits);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b7280" />
      </View>
    );
  }

  return (
    <>
      <Text style={styles.titleText}>Select {tableName}</Text>
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
          data.map((item) => {
            const isSelected = selectedOutfits.some(
              (selected) => selected.id === item.id
            );
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleSelection(item)}
                style={[
                  styles.imageContainer,
                  isSelected && styles.selectedImageContainer,
                ]}
              >
                <Image source={{ uri: item.image_url }} style={styles.image} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  titleText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
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
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedImageContainer: {
    borderColor: "gray",
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
