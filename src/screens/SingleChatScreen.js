import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import LoadingIndicator from "../Components/LoadingIndicator";
import { getFriends } from "../services/firestore";

const FriendsContainer = ({ friend, navigation }) => {
  if (!friend) return null;

  const profileImage = friend.profileImage || "https://via.placeholder.com/150";

  const handleFriendPress = () => {
    console.log(friend);
    navigation.navigate("LiveChatRoom", { friend });
  };

  return (
    <TouchableOpacity
      style={styles.friendUserContainer}
      onPress={handleFriendPress}
    >
      <Image source={{ uri: profileImage }} style={styles.friendUserImage} />
      <Text>{friend.displayName || "Bilinmeyen Kullanıcı"}</Text>
    </TouchableOpacity>
  );
};

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
      console.log(friends);
    });
  }, []);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text>Buralarda hiç arkadaş gözükmüyor :/</Text>
      <Text>Mesajlaşmak için arkadaş ekleyin</Text>
    </View>
  );

  const handleFilterFriends = (text) => {
    setSearchText(text);

    const filtered = friends.filter((friend) =>
      friend.displayName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFriends(filtered);
  };

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <View style={styles.header}>
        <Text>Birebir Sohbet</Text>
      </View>
      <View style={styles.filterFriendContainer}>
        <TextInput
          style={styles.filterFriendInput}
          value={searchText}
          onChangeText={handleFilterFriends}
          placeholder="Arkadaş ara..."
        />
      </View>
      <FlatList
        data={filteredFriends}
        renderItem={({ item }) => (
          <FriendsContainer
            friend={item}
            setIsLoading={setIsLoading}
            navigation={navigation}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={renderEmptyComponent}
        scrollEnabled={true}
        overScrollMode="always"
      />
      <LoadingIndicator visible={isLoading} />
    </SafeAreaView>
  );
};

export default SingleChatScreen;

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 60,
    backgroundColor: "white",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  friendUserContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "yellow",
    padding: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 50,
    marginVertical: 5,
  },
  friendUserImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterFriendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "white",
  },
  filterFriendInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
});
