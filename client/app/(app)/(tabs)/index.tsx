import React from "react";
import { View } from "react-native";
import Swiper from "react-native-deck-swiper";
import { City, Filters, CardItem } from "@/components";
import styles from "@/assets/styles";
import DEMO from "@/assets/data/demo";

export default function ExploreScreen() {
  return (
    <View style={styles.containerHome}>
      <View style={styles.top}>
        <City />
        <Filters />
      </View>
      <View>
        <Swiper
          cards={DEMO}
          infinite
          renderCard={(item) => (
            <CardItem
              image={item.image}
              name={item.name}
              description={item.description}
              price={item.price}
            />
          )}
          verticalSwipe={false}
          onSwipedAll={() => {
            console.log("All cards swiped!");
          }}
          cardIndex={0}
          backgroundColor={"#4FD0E9"}
          stackSize={3}
        />
      </View>
    </View>
  );
}

// TABS

// import React from "react";
// import Swiper from "react-native-deck-swiper";
// import { City, Filters, CardItem } from "@/components";
// import styles from "@/assets/styles";
// import DEMO from "@/assets/data/demo";
// import { View, useWindowDimensions } from "react-native";
// import { TabView, SceneMap } from "react-native-tab-view";

// const FirstRoute = () => (
//   <View style={styles.containerHome}>
//     <View style={styles.top}>
//       <City />
//       <Filters />
//     </View>
//     <View>
//       <Swiper
//         cards={DEMO}
//         infinite
//         renderCard={(item) => (
//           <CardItem
//             image={item.image}
//             name={item.name}
//             description={item.description}
//             price={item.price}
//           />
//         )}
//         verticalSwipe={false}
//         onSwipedAll={() => {
//           console.log("All cards swiped!");
//         }}
//         cardIndex={0}
//         backgroundColor={"#4FD0E9"}
//         stackSize={3}
//       />
//     </View>
//   </View>
// );

// const SecondRoute = () => (
//   <View style={{ flex: 1, backgroundColor: "#673ab7" }} />
// );

// const renderScene = SceneMap({
//   first: FirstRoute,
//   second: SecondRoute,
// });

// export default function ExploreScreen() {
//   const layout = useWindowDimensions();

//   const [index, setIndex] = React.useState(0);
//   const [routes] = React.useState([
//     { key: "first", title: "My Closet" },
//     { key: "second", title: "Shop" },
//   ]);

//   return (
//     <TabView
//       navigationState={{ index, routes }}
//       renderScene={renderScene}
//       onIndexChange={setIndex}
//       initialLayout={{ width: layout.width }}
//       swipeEnabled={false}
//     />
//   );
// }
