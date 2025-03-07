import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Look, Outfit, TableTypes } from "@/types";
import { fetchLooks, loadLooksWithOutfits } from "@/api/FetchLooks";
import { useSession } from "@/contexts/SessionContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 6;
const LOOK_WIDTH = (width * 0.94 - ITEM_MARGIN * 4) / 2; // 40 for container padding, ITEM_MARGIN*4 for margins between items

export default function LookGridView({
  onLookClick,
  tableName,
  profileId,
}: {
  onLookClick: (look: Look, index: number) => void;
  tableName: keyof TableTypes;
  profileId?: string;
}) {
  const { session } = useSession();
  const [looks, setLooks] = useState<Look[]>([]);
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

  const fetchAndCacheLooks = useCallback(
    async (isRefreshing = false) => {
      if (!session) return;

      if (!isRefreshing) setLoading(true);
      const cacheKey = `looks_${tableName}_${session.user.id}_${
        profileId || ""
      }`;
      const cachedLooks = await AsyncStorage.getItem(cacheKey);

      if (cachedLooks && !isRefreshing) {
        const parsedData = JSON.parse(cachedLooks);
        const { timestamp, looks: cachedLooksData } = parsedData;

        // Check if cached data is still valid
        if (Date.now() - timestamp < CACHE_EXPIRY_TIME) {
          const filteredCachedLooksData = cachedLooksData.filter(
            (obj: Look) =>
              obj.is_public === true || obj.user_id === session.user.id
          );
          setLooks(filteredCachedLooksData);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Fetch new data if cache is expired or doesn't exist
      try {
        const fetchedLooks = await fetchLooks(profileId);
        const fetchedLooksWithOutfits = await loadLooksWithOutfits(
          fetchedLooks
        );

        const filteredFetchedLooksWithOutfits = fetchedLooksWithOutfits.filter(
          (obj: Look) =>
            obj.is_public === true || obj.user_id === session.user.id
        );
        setLooks(filteredFetchedLooksWithOutfits);

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
    [tableName, session, profileId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAndCacheLooks();
    }, 300); // Debounce the fetch by 300ms

    return () => clearTimeout(timer);
  }, [tableName, fetchAndCacheLooks]);

  const onRefresh = useCallback(() => {
    const now = Date.now();
    if (lastRefreshTime && now - lastRefreshTime < REFRESH_COOLDOWN) {
      console.log("Refresh is throttled. Please wait before refreshing again.");
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    setLastRefreshTime(now);
    fetchAndCacheLooks(true);
  }, [fetchAndCacheLooks, lastRefreshTime]);

  const renderOutfitGrid = (outfits: Outfit[]) => {
    const firstFourOutfits = outfits.slice(0, 4); // Get up to the first 4 outfits
    const outfitSize = (LOOK_WIDTH - 24) / 2; // Size for each outfit thumbnail

    // Create a 2x2 grid structure
    const grid: Outfit[][] = [
      [undefined as unknown as Outfit, undefined as unknown as Outfit],
      [undefined as unknown as Outfit, undefined as unknown as Outfit],
    ];

    // Fill the grid with available outfits
    firstFourOutfits.forEach((outfit, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      grid[row][col] = outfit;
    });

    return (
      <View style={styles.outfitGridContainer}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.outfitRow}>
            {row.map((outfit, colIndex) => (
              <View
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.outfitCell,
                  { width: outfitSize, height: outfitSize },
                  colIndex % 2 === 0
                    ? styles.leftOutfitCell
                    : styles.rightOutfitCell,
                ]}
              >
                {outfit ? (
                  <Image
                    source={{ uri: outfit.image_url }}
                    style={styles.outfitImage}
                    contentFit="cover"
                    transition={300}
                  />
                ) : (
                  <View style={styles.emptyOutfitCell} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading looks...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {looks.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="albums-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No looks found</Text>
            <Text style={styles.emptyStateText}>
              Create a look by combining your favorite outfits
            </Text>
          </View>
        ) : (
          <View style={styles.looksContainer}>
            {looks.map((look, index) => (
              <TouchableOpacity
                key={look.id}
                style={styles.lookCard}
                onPress={() => onLookClick(look, index)}
                activeOpacity={0.8}
              >
                {renderOutfitGrid(look.outfits || [])}
                <View style={styles.lookInfoContainer}>
                  <Text style={styles.lookName} numberOfLines={1}>
                    {look.name || "Unnamed Look"}
                  </Text>
                  <Text style={styles.outfitCount}>
                    {look.outfits?.length || 0} outfits
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  looksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  lookCard: {
    width: LOOK_WIDTH,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  outfitGridContainer: {
    padding: 8,
  },
  outfitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  outfitCell: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  leftOutfitCell: {
    marginRight: 4,
  },
  rightOutfitCell: {
    marginLeft: 4,
  },
  outfitImage: {
    width: "100%",
    height: "100%",
  },
  emptyOutfitCell: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  lookInfoContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  lookName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  outfitCount: {
    fontSize: 14,
    color: "#666",
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
