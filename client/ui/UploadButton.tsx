import React from "react";
import { StyleSheet } from "react-native";
import { FAB, Portal, Provider } from "react-native-paper";

export default function UploadButton({ onPress }: { onPress: () => void }) {
  const [state, setState] = React.useState({ open: false });
  return <FAB icon="plus" style={styles.fab} onPress={onPress} />;
  const onStateChange = ({ open }: { open: boolean }) => setState({ open });

  const { open } = state;

  return (
    <Provider>
      <Portal>
        <FAB.Group
          visible={true}
          open={open}
          icon={open ? "calendar-today" : "plus"}
          actions={[
            { icon: "plus", onPress: () => console.log("Pressed add") },
            {
              icon: "star",
              label: "Star",
              //   onPress: () => console.log("Pressed star"),
              onPress: onPress,
            },
            {
              icon: "email",
              label: "Email",
              onPress: () => console.log("Pressed email"),
            },
            {
              icon: "bell",
              label: "Remind",
              onPress: () => console.log("Pressed notifications"),
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </Provider>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#EAE6E5",
  },
});
