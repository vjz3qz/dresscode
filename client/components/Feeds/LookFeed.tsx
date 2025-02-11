import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage"; // for local caching
import { Look, Outfit, TableTypes } from "@/types";
import { fetchLooks, loadLooksWithOutfits } from "@/api/FetchLooks";
import { useSession } from "@/contexts/SessionContext";

const { height } = Dimensions.get("window");

export default function LookFeed({
  onLookClick,
  tableName,
}: {
  onLookClick: (look: Look, index: number) => void;
  tableName: keyof TableTypes;
}) {
  const { session } = useSession();
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);

  const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
  const REFRESH_COOLDOWN = 10000; // Cooldown time in milliseconds (e.g., 10 seconds)

  const fetchAndCacheLooks = useCallback(
    async (isRefreshing = false) => {
      if (!session) return;

      if (!isRefreshing) setLoading(true);
      const cacheKey = `looks_${tableName}`;
      const cachedLooks = await AsyncStorage.getItem(cacheKey);

      if (cachedLooks && !isRefreshing) {
        const parsedData = JSON.parse(cachedLooks);
        const { timestamp, looks: cachedLooksData } = parsedData;

        // Check if cached data is still valid
        if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
          setLooks(cachedLooksData);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Fetch new data if cache is expired or doesn't exist
      try {
        const fetchedLooks = await fetchLooks();
        const fetchedLooksWithOutfits = await loadLooksWithOutfits(
          fetchedLooks,
          session
        );

        setLooks(fetchedLooksWithOutfits);

        // Cache the data with a new timestamp
        AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: Date.now(),
            looks: fetchedLooksWithOutfits,
          })
        );
      } catch (error: any) {
        console.error("Error fetching looks:", error.message);
        setLooks([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tableName, session]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAndCacheLooks();
    }, 300); // Debounce the fetch by 300ms to avoid excessive requests

    return () => clearTimeout(timer);
  }, [tableName, fetchAndCacheLooks]);

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
    fetchAndCacheLooks(true);
  }, [fetchAndCacheLooks, lastRefreshTime]);

  const renderOutfitGrid = (outfits: Outfit[]) => {
    const firstFourOutfits = outfits.slice(0, 4); // Get up to the first 4 outfits

    const rows: Outfit[][] = [];
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (!rows[i]) rows[i] = [];
        rows[i].push({
          id: i + j + Math.floor(Math.random() * 1000),
          image_url: "",
        } as Outfit); // Placeholder outfit
      }
    }

    let k = 0;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (k >= firstFourOutfits.length) break;
        rows[i][j] = firstFourOutfits[k];
        k++;
      }
    }

    return (
      <View style={styles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((outfit) =>
              outfit.image_url ? (
                <View key={outfit.id} style={styles.cell}>
                  <Image
                    source={{
                      uri: outfit.image_url,
                    }}
                    style={styles.gridImage}
                  />
                </View>
              ) : (
                <View
                  key={outfit.id}
                  style={[styles.cell, styles.placeholderCell]}
                />
              )
            )}
          </View>
        ))}
      </View>
    );
  };

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
      {looks.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No {tableName} found. Add some {tableName}!
          </Text>
        </View>
      ) : (
        looks.map((look, index) => (
          <TouchableOpacity
            key={look.id}
            style={styles.lookContainer}
            onPress={() => onLookClick(look, index)}
          >
            {renderOutfitGrid(look.outfits || [])}
            <View style={styles.textContainer}>
              <Text style={styles.lookTitle}>{look.name}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  lookContainer: {
    width: "47%",
    marginHorizontal: "1.5%",
    height: height / 4.35,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  textContainer: {
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  lookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  gridContainer: {
    flexDirection: "column",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cell: {
    flex: 1,
    margin: 4,
    alignItems: "center",
  },
  gridImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  placeholderCell: {
    width: 77,
    height: 77,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: "#ddd",
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
