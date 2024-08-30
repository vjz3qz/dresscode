import React from "react";
import {
  Text,
  View,
  ImageBackground,
  Dimensions,
  ViewStyle,
} from "react-native";
import { CardItemT } from "../types";
import styles from "../assets/styles";

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

  return (
    <View style={styles.containerCardItem}>
      {/* IMAGE BACKGROUND */}
      <ImageBackground source={image} style={imageStyle}>
        <View style={styles.overlay}>
          {/* MATCHES */}
          {/* NAME */}
          <Text style={nameStyle}>{name}</Text>

          {/* DESCRIPTION */}
          {description && (
            <Text style={styles.descriptionCardItem}>{description}</Text>
          )}
          {price && <Text style={styles.descriptionCardItem}>{price}</Text>}
        </View>
      </ImageBackground>
    </View>
  );
};

export default CardItem;
