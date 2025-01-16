import React, { useImperativeHandle, forwardRef } from "react";
import { Image, StyleSheet, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface DraggableImageProps {
  imageUri: string;
  initialX?: number;
  initialY?: number;
  initialSize?: number;
}

export interface DraggableImageRef {
  getPositionAndSize: () => { x: number; y: number; size: number };
}

const DraggableImage = forwardRef<DraggableImageRef, DraggableImageProps>(
  (
    {
      imageUri,
      initialX = width / 2 - 75,
      initialY = height / 2 - 75,
      initialSize = 150,
    },
    ref
  ) => {
    const translateX = useSharedValue(initialX);
    const translateY = useSharedValue(initialY);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    useImperativeHandle(ref, () => ({
      getPositionAndSize: () => ({
        x: translateX.value,
        y: translateY.value,
        size: initialSize * savedScale.value,
      }),
    }));

    const pinchGesture = Gesture.Pinch()
      .onUpdate((event) => {
        scale.value = savedScale.value * event.scale;
      })
      .onEnd(() => {
        savedScale.value = scale.value;
      });

    const panGesture = Gesture.Pan()
      .onStart(() => {
        startX.value = translateX.value;
        startY.value = translateY.value;
      })
      .onUpdate((event) => {
        translateX.value = startX.value + event.translationX;
        translateY.value = startY.value + event.translationY;
      })
      .onEnd(() => {
        translateX.value = withSpring(translateX.value);
        translateY.value = withSpring(translateY.value);
      });

    const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
        ],
      };
    });

    return (
      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={[styles(initialSize).box, animatedStyle]}>
          <Image
            source={{ uri: imageUri }}
            style={styles(initialSize).image}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    );
  }
);

const styles = (initialSize: number) =>
  StyleSheet.create({
    box: {
      width: initialSize,
      height: initialSize,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
    },
    image: {
      width: "100%",
      height: "100%",
    },
  });

export default DraggableImage;
