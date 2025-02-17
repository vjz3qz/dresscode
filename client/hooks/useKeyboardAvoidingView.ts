import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardEvent,
  LayoutAnimation,
  Platform,
} from "react-native";

export const useKeyboardAvoidingView = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShow = (e: KeyboardEvent) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(e.endCoordinates.height);
    };

    const keyboardWillHide = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    };

    const keyboardDidShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
    };

    const keyboardDidHide = () => {
      setKeyboardHeight(0);
    };

    let keyboardWillShowListener: any;
    let keyboardWillHideListener: any;
    let keyboardDidShowListener: any;
    let keyboardDidHideListener: any;

    if (Platform.OS === "ios") {
      keyboardWillShowListener = Keyboard.addListener(
        "keyboardWillShow",
        keyboardWillShow
      );
      keyboardWillHideListener = Keyboard.addListener(
        "keyboardWillHide",
        keyboardWillHide
      );
    } else {
      keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        keyboardDidShow
      );
      keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        keyboardDidHide
      );
    }

    return () => {
      if (Platform.OS === "ios") {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      } else {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      }
    };
  }, []);

  return keyboardHeight;
};
