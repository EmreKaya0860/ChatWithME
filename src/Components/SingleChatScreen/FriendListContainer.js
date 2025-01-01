import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

const FriendListContainer = ({ friend, navigation }) => {
  const defaultImageUrl = process.env.EXPO_PUBLIC_DEFAULT_FRIEND_IMAGE_URL;
  if (!friend) return null;
  const profileImage = friend.profileImage || defaultImageUrl;
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

export default FriendListContainer;

const styles = StyleSheet.create({
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
});
