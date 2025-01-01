import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingIndicator from "../Components/LoadingIndicator";
import { getFriends } from "../services/firestore";

import FriendListContainer from "../Components/SingleChatScreen/FriendListContainer";
import FriendListEmptyComponent from "../Components/SingleChatScreen/FriendListEmptyComponent";

const SingleChatScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchText, setSearchText] = useState("");

  const fetchFriends = async () => {
    const friendsData = await getFriends();
    setFriends(friendsData);
    setFilteredFriends(friendsData);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchFriends();
    navigation.addListener("focus", () => {
      fetchFriends();
    });
  }, []);

  const handleFilterFriends = (text) => {
    setSearchText(text);
    const filtered = friends.filter((friend) =>
      friend.displayName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFriends(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Birebir Sohbet</Text>
      </View>
      <View style={styles.filterFriendContainer}>
        <TextInput
          style={styles.filterFriendInput}
          value={searchText}
          onChangeText={handleFilterFriends}
          placeholder="Arkadaş ara..."
          placeholderTextColor="#aaa"
        />
      </View>
      <FlatList
        data={filteredFriends}
        renderItem={({ item }) => (
          <FriendListContainer friend={item} navigation={navigation} />
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={FriendListEmptyComponent}
      />
      <LoadingIndicator visible={isLoading} />
    </SafeAreaView>
  );
};

export default SingleChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  header: {
    width: "100%",
    height: 60,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  filterFriendContainer: {
    padding: 10,
    backgroundColor: "#3D3D3D",
  },
  filterFriendInput: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
  },
});
