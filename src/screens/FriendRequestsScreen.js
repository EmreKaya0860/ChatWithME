import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import { getPendingFriendRequests } from "../services/firestore";

import LoadingIndicator from "../Components/LoadingIndicator";

const FriendRequestContainer = ({ request }) => {
  return (
    <View style={styles.requestUserContainer}>
      <Image
        source={{ uri: request.profileImage }}
        style={styles.requestUserImage}
      />
      <Text>{request.displayName}</Text>
      <TouchableOpacity style={styles.acceptButton}>
        <Text>Kabul Et</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.rejectButton}>
        <Text>Reddet</Text>
      </TouchableOpacity>
    </View>
  );
};

const FriendRequestsScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [profilePictureModalVisibility, setProfilePictureModalVisibility] =
    useState(false);
  useEffect(() => {
    setIsLoading(true);
    const fetchFriendRequests = async () => {
      const friendRequestsData = await getPendingFriendRequests();
      setFriendRequests(friendRequestsData);
      setIsLoading(false);
    };

    fetchFriendRequests();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <FlatList
        data={friendRequests}
        renderItem={({ item }) => <FriendRequestContainer request={item} />}
      />
      {/* <Modal>
        <View style={styles.profilePictureModal}>
          <Image
            source={{ uri: request.profileImage }}
            style={styles.profilePictureModalContent}
          />
        </View>
      </Modal> */}
      <LoadingIndicator visible={isLoading} />
    </SafeAreaView>
  );
};

export default FriendRequestsScreen;

const styles = StyleSheet.create({
  requestUserContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "red",
    padding: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  requestUserImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 5,
    borderRadius: 5,
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 5,
    borderRadius: 5,
  },
  profilePictureModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  profilePictureModalContent: {
    width: 300,
    borderRadius: 10,
    elevation: 5,
  },
});
