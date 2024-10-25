import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingIndicator from "../Components/LoadingIndicator";
import { getFriends } from "../services/firestore";

import { createGroupChat, getJoinedGroups } from "../services/livechat";

const FriendsContainer = ({
  friend,
  isSelected,
  handleAddFriend,
  handleRemoveFriend,
}) => {
  if (!friend) return null;
  const profileImage = friend.profileImage || "https://via.placeholder.com/150";

  return (
    <View style={styles.friendUserContainer}>
      <Image source={{ uri: profileImage }} style={styles.friendUserImage} />
      <Text>{friend.displayName || "Bilinmeyen Kullanıcı"}</Text>
      {!isSelected ? (
        <TouchableOpacity onPress={() => handleAddFriend(friend)}>
          <Text>Ekle</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => handleRemoveFriend(friend)}>
          <Text>Çıkar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const GroupsContainer = ({ group, navigation, friends }) => {
  if (!group) return null;
  const handleGroupPress = () => {
    console.log(group);
    navigation.navigate("GroupLiveChatRoom", { group, friends });
  };
  return (
    <TouchableOpacity
      style={styles.friendUserContainer}
      onPress={handleGroupPress}
    >
      <MaterialIcons name="groups" size={35} color="black" />
      <Text>{group.groupName || "Bilinmeyen Grup"}</Text>
    </TouchableOpacity>
  );
};

const GroupChatScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [friendSearchText, setFriendSearchText] = useState("");
  const [groupSearchText, setGroupSearchText] = useState("");
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] =
    useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [filteredJoinedGroups, setFilteredJoinedGroups] = useState([]);

  const fetchFriends = async () => {
    const friendsData = await getFriends();
    setFriends(friendsData);
    setFilteredFriends(friendsData);
  };

  const fetchJoinedGroups = async () => {
    const groups = await getJoinedGroups();
    setJoinedGroups(groups);
    setFilteredJoinedGroups(groups);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchJoinedGroups();
    fetchFriends();
    setGroupSearchText("");
    navigation.addListener("focus", () => {
      fetchFriends();
      fetchJoinedGroups();
      setGroupSearchText("");
    });
  }, []);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text>Buralar boş gözüküyor :/</Text>
    </View>
  );

  const handleFilterFriends = (text) => {
    setFriendSearchText(text);
    const filtered = friends.filter((friend) =>
      friend.displayName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFriends(filtered);
  };

  const handleFilterGroups = (text) => {
    setGroupSearchText(text);
    const filtered = joinedGroups.filter((group) =>
      group.groupName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredJoinedGroups(filtered);
  };

  const handleAddFriend = (friend) => {
    setGroupMembers([...groupMembers, friend]);
  };

  const handleRemoveFriend = (friend) => {
    setGroupMembers(
      groupMembers.filter((member) => member.userId !== friend.userId)
    );
  };

  const handleCreateGroup = async () => {
    setIsLoading(true);
    console.log(groupName, groupMembers);
    await createGroupChat(groupName, groupMembers);
    setIsCreateGroupModalVisible(!isCreateGroupModalVisible);
    setGroupName("");
    setGroupMembers([]);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <View style={styles.header}>
        <Text>Grup Sohbet</Text>
      </View>
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => {
          setIsCreateGroupModalVisible(!isCreateGroupModalVisible);
        }}
      >
        <Octicons name="diff-added" size={30} color="black" />
        <Text>Yeni{"\n"}Grup Oluştur</Text>
      </TouchableOpacity>
      <View style={styles.filterFriendContainer}>
        <TextInput
          style={styles.filterFriendInput}
          value={groupSearchText}
          onChangeText={handleFilterGroups}
          placeholder="Grup ara..."
        />
      </View>
      {filteredJoinedGroups.length > 0 ? (
        <FlatList
          data={filteredJoinedGroups}
          renderItem={({ item }) => (
            <GroupsContainer
              group={item}
              navigation={navigation}
              friends={friends}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={true}
          overScrollMode="always"
          ListEmptyComponent={renderEmptyComponent}
        />
      ) : (
        renderEmptyComponent()
      )}
      <Modal transparent={true} visible={isCreateGroupModalVisible}>
        <View style={styles.createGroupModalContainer}>
          <View style={styles.createGroupModalContent}>
            <Text>Grup Oluştur</Text>
            <TextInput
              placeholder="Grup Adı"
              onChangeText={(text) => setGroupName(text)}
            />
            <Text>Üyeler</Text>
            <TextInput
              style={styles.filterFriendInput}
              value={friendSearchText}
              onChangeText={handleFilterFriends}
              placeholder="Arkadaş ara..."
            />
            {filteredFriends.length > 0
              ? filteredFriends.map((friend) => (
                  <FriendsContainer
                    key={friend.userId}
                    friend={friend}
                    isSelected={groupMembers.some(
                      (member) => member.userId === friend.userId
                    )}
                    handleAddFriend={handleAddFriend}
                    handleRemoveFriend={handleRemoveFriend}
                  />
                ))
              : renderEmptyComponent()}
            <TouchableOpacity onPress={handleCreateGroup}>
              <Text>Oluştur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setIsCreateGroupModalVisible(!isCreateGroupModalVisible)
              }
            >
              <Text>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LoadingIndicator visible={isLoading} />
    </SafeAreaView>
  );
};

export default GroupChatScreen;

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
  createGroupButton: {
    alignItems: "center",
    right: 0,
    bottom: 0,
    width: 120,
    height: 40,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 10,
  },
  createGroupModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createGroupModalContent: {
    width: "80%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
});
