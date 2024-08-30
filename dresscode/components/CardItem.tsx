import React from "react";
import {
  Text,
  View,
  ImageBackground,
  Dimensions,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CardItemT } from "../types";
import styles from "@/assets/styles";

const CardItem = ({ description, image, name, price }: CardItemT) => {
  // Custom styling
  const fullWidth = Dimensions.get("window").width;

  const imageStyle: ViewStyle = {
    borderRadius: 8,
    width: fullWidth - 80,
    height: 600,
    margin: 20,
    overflow: "hidden", // Ensure the content within the ImageBackground is clipped to the border radius
  };

  const nameStyle = [
    {
      paddingTop: 15,
      paddingBottom: 7,
      color: "#fff", // White text for better contrast on background image
      fontSize: 30,
    },
  ];

  const gradientHeight = 600 / 2; // 50% of image height

  return (
    <View style={styles.containerCardItem}>
      {/* IMAGE BACKGROUND */}
      <ImageBackground source={image} style={imageStyle}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)"]}
          style={[styles.gradient, { height: gradientHeight }]}
        >
          <View style={styles.overlay}>
            <Text style={nameStyle}>{name}</Text>
            {description && (
              <Text style={styles.descriptionCardItem}>{description}</Text>
            )}
            {price && <Text style={styles.priceCardItem}>{price}</Text>}
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};
export default CardItem;
