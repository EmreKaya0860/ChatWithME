import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  getPendingFriendRequests,
  getUserDataWithEmail,
  updatePendingFriendRequests,
} from "../services/firestore";
import { auth } from "../services/authentication";
import LoadingIndicator from "../Components/LoadingIndicator";

const FriendRequestContainer = ({
  request,
  setIsLoading,
  fetchFriendRequests,
}) => {
  if (!request) return null;

  const profileImage =
    request.profileImage || "https://via.placeholder.com/150";

  const handleUpdateFriendRequest = async (senderEmail, status) => {
    setIsLoading(true);
    const sender = await getUserDataWithEmail(senderEmail);
    const senderDocId = sender[1].docId;
    const receiver = await getUserDataWithEmail(auth.currentUser.email);
    const receiverEmail = auth.currentUser.email;
    const receiverDocId = receiver[1].docId;
    const result = await updatePendingFriendRequests(
      senderEmail,
      senderDocId,
      receiverEmail,
      receiverDocId,
      status
    );
    console.log(result);
    fetchFriendRequests();
    setIsLoading(false);
  };

  return (
    <View style={styles.requestUserContainer}>
      <Image source={{ uri: profileImage }} style={styles.requestUserImage} />
      <Text>{request.displayName || "Bilinmeyen Kullanıcı"}</Text>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleUpdateFriendRequest(request.email, true)}
      >
        <Text>Kabul Et</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.rejectButton}
        onPress={() => handleUpdateFriendRequest(request.email, false)}
      >
        <Text>Reddet</Text>
      </TouchableOpacity>
    </View>
  );
};

const FriendRequestsScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);

  const fetchFriendRequests = async () => {
    const friendRequestsData = await getPendingFriendRequests();
    setFriendRequests(friendRequestsData || []);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);

    fetchFriendRequests();
  }, []);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text>Bekleyen arkadaşlık isteğiniz yok.</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      {isLoading ? (
        <LoadingIndicator visible={isLoading} />
      ) : (
        <FlatList
          data={friendRequests}
          renderItem={({ item }) => (
            <FriendRequestContainer
              request={item}
              setIsLoading={setIsLoading}
              fetchFriendRequests={fetchFriendRequests}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

export default FriendRequestsScreen;

const styles = StyleSheet.create({
  requestUserContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "yellow",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
