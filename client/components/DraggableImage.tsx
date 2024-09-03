import React from "react";
import { Image, StyleSheet, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const DraggableImage = ({
  imageUri,
  initialX = width / 2 - 75,
  initialY = height / 2 - 75,
  initialSize = 150,
}: {
  imageUri: string;
  initialX?: number;
  initialY?: number;
  initialSize?: number;
}) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

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
      <Animated.View style={[styles.box(initialSize), animatedStyle]}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  box: (initialSize) => ({
    width: initialSize,
    height: initialSize,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  }),
  image: {
    width: "100%",
    height: "100%",
  },
});

export default DraggableImage;
