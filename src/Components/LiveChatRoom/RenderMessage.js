import { React } from "react";
import { StyleSheet, Text, View } from "react-native";
import { auth } from "../../services/authentication";

const RenderMessage = ({ item, friend }) => {
  const formatSendTime = (sendTime) => {
    const messageDate = sendTime.toDate();
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };
  const isMyMessage = item.senderId === auth.currentUser.uid;
  return (
    <View
      style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.friendMessage,
      ]}
    >
      <Text style={styles.senderName}>
        {isMyMessage ? "Ben" : friend.displayName}
      </Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>{formatSendTime(item.sendTime)}</Text>
    </View>
  );
};

export default RenderMessage;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "70%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  myMessage: {
    backgroundColor: "#bb86fc",
    alignSelf: "flex-end",
  },
  friendMessage: {
    backgroundColor: "#3D3D3D",
    alignSelf: "flex-start",
  },
  senderName: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  messageTime: {
    marginTop: 5,
    fontSize: 12,
    color: "#bbb",
    alignSelf: "flex-end",
  },
});
