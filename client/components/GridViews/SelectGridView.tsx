import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAllImageUrls } from "@/api/FetchImageUrl";
import type { Outfit, TableTypes } from "@/types";
import { useSession } from "@/contexts/SessionContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 6;
const ITEM_WIDTH = (width * 0.94 - ITEM_MARGIN * 6) / 3; // 40 for container padding, ITEM_MARGIN*6 for margins between items

export default function SelectGridView({
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Cache settings
  const CACHE_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour
  const REFRESH_COOLDOWN = 10000; // 10 seconds

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fetchAndCacheOutfits = useCallback(
    async (isRefreshing = false) => {
      if (!session) return;

      if (!isRefreshing) setLoading(true);
      const cacheKey = `outfits_${tableName}_${session.user.id}`;
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
        const items = (await fetchAllImageUrls(tableName)) as Outfit[];
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
    }, 300); // Debounce fetch by 300ms

    return () => clearTimeout(timer);
  }, [tableName, fetchAndCacheOutfits]);

  const onRefresh = useCallback(() => {
    const now = Date.now();
    if (lastRefreshTime && now - lastRefreshTime < REFRESH_COOLDOWN) {
      console.log("Refresh is throttled. Please wait before refreshing again.");
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    setLastRefreshTime(now);
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
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading {tableName}...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Select {tableName}</Text>
        <Text style={styles.selectionCount}>
          {selectedOutfits.length} selected
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {data.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name={
                tableName === "outfits" ? "people-outline" : "albums-outline"
              }
              size={60}
              color="#ccc"
            />
            <Text style={styles.emptyStateTitle}>No {tableName} found</Text>
            <Text style={styles.emptyStateText}>
              Add some {tableName} to your collection
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {data.map((item) => {
              const isSelected = selectedOutfits.some(
                (selected) => selected.id === item.id
              );
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleSelection(item)}
                  style={[
                    styles.gridItem,
                    isSelected && styles.selectedGridItem,
                  ]}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.itemImage}
                    contentFit="cover"
                    transition={300}
                  />
                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#333"
                      />
                    </View>
                  )}
                  {item.name && (
                    <View style={styles.itemNameContainer}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  selectionCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2,
    margin: ITEM_MARGIN,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: "relative",
  },
  selectedGridItem: {
    borderWidth: 2,
    borderColor: "#333",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  checkmarkContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 2,
  },
  itemNameContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  itemName: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
