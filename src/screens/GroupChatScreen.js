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
      <Text style={styles.friendUserName}>
        {friend.displayName || "Bilinmeyen Kullanıcı"}
      </Text>
      {!isSelected ? (
        <TouchableOpacity onPress={() => handleAddFriend(friend)}>
          <Text style={styles.addRemoveText}>Ekle</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => handleRemoveFriend(friend)}>
          <Text style={styles.addRemoveText}>Çıkar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const GroupsContainer = ({ group, navigation, friends }) => {
  if (!group) return null;
  const handleGroupPress = () => {
    navigation.navigate("GroupLiveChatRoom", { group, friends });
  };
  return (
    <TouchableOpacity
      style={styles.friendUserContainer}
      onPress={handleGroupPress}
    >
      <MaterialIcons name="groups" size={35} color="#bb86fc" />
      <Text style={styles.friendUserName}>
        {group.groupName || "Bilinmeyen Grup"}
      </Text>
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
      <Text style={styles.emptyText}>Buralar boş gözüküyor :/</Text>
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
    await createGroupChat(groupName, groupMembers);
    setIsCreateGroupModalVisible(!isCreateGroupModalVisible);
    setGroupName("");
    setGroupMembers([]);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Grup Sohbet</Text>
      </View>
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={() => setIsCreateGroupModalVisible(!isCreateGroupModalVisible)}
      >
        <Octicons name="diff-added" size={30} color="#bb86fc" />
        <Text style={styles.createGroupText}>Yeni{"\n"}Grup Oluştur</Text>
      </TouchableOpacity>
      <View style={styles.filterFriendContainer}>
        <TextInput
          style={styles.filterFriendInput}
          value={groupSearchText}
          onChangeText={handleFilterGroups}
          placeholder="Grup ara..."
          placeholderTextColor="#aaa"
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
            <Text style={styles.modalTitle}>Grup Oluştur</Text>
            <TextInput
              placeholder="Grup Adı"
              style={styles.modalInput}
              onChangeText={(text) => setGroupName(text)}
              placeholderTextColor="#aaa"
            />
            <Text style={styles.modalTitle}>Üyeler</Text>
            <TextInput
              style={styles.modalInput}
              value={friendSearchText}
              onChangeText={handleFilterFriends}
              placeholder="Arkadaş ara..."
              placeholderTextColor="#aaa"
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
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCreateGroup}
            >
              <Text style={styles.buttonText}>Oluştur</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() =>
                setIsCreateGroupModalVisible(!isCreateGroupModalVisible)
              }
            >
              <Text style={styles.buttonText}>Vazgeç</Text>
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
    gap: 10,
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
    flex: 1,
  },
  addRemoveText: {
    color: "#bb86fc",
    fontWeight: "bold",
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
  createGroupButton: {
    alignItems: "center",
    flexDirection: "row",
    marginHorizontal: 10,
  },
  createGroupText: {
    color: "#bb86fc",
    marginLeft: 10,
  },
  createGroupModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  createGroupModalContent: {
    width: "80%",
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: "#3D3D3D",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#bb86fc",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
