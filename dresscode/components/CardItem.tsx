import React from "react";
import {
  Text,
  View,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Icon from "./Icon";
import { CardItemT } from "../types";
import styles from "../assets/styles";

const CardItem = ({
  description,
  hasActions,
  hasVariant,
  image,
  isOnline,
  matches,
  name,
}: CardItemT) => {
  // Custom styling
  const fullWidth = Dimensions.get("window").width;

  const imageStyle: ViewStyle = {
    borderRadius: 8,
    width: hasVariant ? fullWidth / 2 - 30 : fullWidth - 80,
    height: hasVariant ? 170 : 600,
    margin: hasVariant ? 0 : 20,
    overflow: "hidden", // Ensure the content within the ImageBackground is clipped to the border radius
  };

  const nameStyle = [
    {
      paddingTop: hasVariant ? 10 : 15,
      paddingBottom: hasVariant ? 5 : 7,
      color: "#fff", // White text for better contrast on background image
      fontSize: hasVariant ? 15 : 30,
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
          {/* {price && <Text style={styles.descriptionCardItem}>{price}</Text>} */}
        </View>
      </ImageBackground>
    </View>
  );
};

export default CardItem;
