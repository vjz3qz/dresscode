import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  //   ViewStyle
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionItem = ({
  title,
  children,
  style,
}: {
  title: string;
  children: React.ReactNode;
  // style?: ViewStyle,
  style?: any; // Add optional style prop for customization, or
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    // Animate state change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={toggleExpand} style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
  },
  header: {
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    padding: 10,
    backgroundColor: "#fff",
  },
});

export default AccordionItem;
