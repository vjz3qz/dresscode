import { Dimensions } from "react-native";

export const theme = {
  colors: {
    primary: "#E6E1DF", // Light beige background
    secondary: "#D4A373", // Accent color (burgundy button)
    text: {
      primary: "#1F1F1F", // Main text
      secondary: "#6B7280", // Subtitle text
      light: "#FFFFFF", // Text on dark backgrounds
    },
    background: {
      main: "#FFFFFF",
      secondary: "#F8F8F8",
      accent: "rgba(104, 143, 229, 0.5)",
    },
    border: "#E0E0E0",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 20,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: "bold",
    },
    h2: {
      fontSize: 20,
      fontWeight: "600",
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
      color: "#6B7280",
    },
  },
};
export const PRIMARY_COLOR = "#7444C0";
export const SECONDARY_COLOR = "#5636B8";
export const WHITE = "#FFFFFF";
export const GRAY = "#757E90";
export const DARK_GRAY = "#363636";
export const BLACK = "#000000";

export const ONLINE_STATUS = "#46A575";
export const OFFLINE_STATUS = "#D04949";

export const STAR_ACTIONS = "#FFA200";
export const LIKE_ACTIONS = "#B644B2";
export const DISLIKE_ACTIONS = "#363636";
export const FLASH_ACTIONS = "#5028D7";

export const DIMENSION_WIDTH = Dimensions.get("window").width;
export const DIMENSION_HEIGHT = Dimensions.get("window").height;
