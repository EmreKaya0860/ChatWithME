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
    navigation.navigate("LiveChatRoom", { friend });
  };

  return (
    <TouchableOpacity
      style={styles.friendUserContainer}
      onPress={handleFriendPress}
    >
      <Image source={{ uri: profileImage }} style={styles.friendUserImage} />
      <Text style={styles.friendUserName}>
        {friend.displayName || "Bilinmeyen Kullanıcı"}
      </Text>
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
    });
  }, []);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Buralarda hiç arkadaş gözükmüyor :/</Text>
      <Text style={styles.emptyText}>Mesajlaşmak için arkadaş ekleyin</Text>
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
          <FriendsContainer friend={item} navigation={navigation} />
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={renderEmptyComponent}
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
  friendUserContainer: {
    width: "100%",
    padding: 15,
    backgroundColor: "#3D3D3D",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    borderRadius: 10,
  },
  friendUserImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 15,
  },
  friendUserName: {
    color: "#fff",
    fontSize: 16,
  },
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
