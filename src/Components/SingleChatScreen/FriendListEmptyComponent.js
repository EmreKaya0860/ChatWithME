import React from "react";
import { StyleSheet, Text, View } from "react-native";

const FriendListEmptyComponent = () => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Buralarda hiç arkadaş gözükmüyor :/</Text>
      <Text style={styles.emptyText}>Mesajlaşmak için arkadaş ekleyin</Text>
    </View>
  );
};

export default FriendListEmptyComponent;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
});
