import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingIndicator from "../Components/LoadingIndicator";
import { auth } from "../services/authentication";
import {
  getPendingFriendRequests,
  getUserDataWithEmail,
  updatePendingFriendRequests,
} from "../services/firestore";

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
      <Text style={styles.requestUserName}>
        {request.displayName || "Bilinmeyen Kullanıcı"}
      </Text>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleUpdateFriendRequest(request.email, true)}
      >
        <Text style={styles.buttonText}>Kabul Et</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.rejectButton}
        onPress={() => handleUpdateFriendRequest(request.email, false)}
      >
        <Text style={styles.buttonText}>Reddet</Text>
      </TouchableOpacity>
    </View>
  );
};

const FriendRequestsScreen = ({ navigation }) => {
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
    navigation.addListener("focus", () => {
      fetchFriendRequests();
    });
  }, []);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Bekleyen arkadaşlık isteğiniz yok.</Text>
    </View>
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleGoBack}>
        <MaterialIcons name="navigate-before" size={35} color="#fff" />
      </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  requestUserContainer: {
    width: "100%",
    padding: 15,
    backgroundColor: "#3D3D3D",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    borderRadius: 10,
  },
  requestUserImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 15,
  },
  requestUserName: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
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
    marginTop: 10,
  },
});
