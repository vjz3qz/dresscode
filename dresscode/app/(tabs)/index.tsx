import React, { useState } from "react";
import { View, ImageBackground } from "react-native";
import Swiper from "react-native-deck-swiper";
import { City, Filters, CardItem } from "../../components";
import styles from "../../assets/styles";
import DEMO from "../../assets/data/demo";

export default function HomeScreen() {
  const [swiper, setSwiper] = useState<Swiper | null>(null);

  return (
    <ImageBackground
      source={require("../../assets/images/bg.png")}
      style={styles.bg}
    >
      <View style={styles.containerHome}>
        <View style={styles.top}>
          <City />
          <Filters />
        </View>

        <Swiper
          cards={DEMO}
          renderCard={(item) => (
            <CardItem
              hasActions
              image={item.image}
              name={item.name}
              description={item.description}
              matches={item.match}
            />
          )}
          verticalSwipe={false}
          onSwipedAll={() => {
            console.log("All cards swiped!");
          }}
          cardIndex={0}
          backgroundColor={"#4FD0E9"}
          stackSize={3}
          ref={(newSwiper): void => setSwiper(newSwiper)}
        />
      </View>
    </ImageBackground>
  );
}
