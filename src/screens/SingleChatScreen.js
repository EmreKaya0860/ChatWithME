import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { getFriends } from "../services/firestore";

const SingleChatScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const fetchFriends = async () => {
    const friendsData = await getFriends();
    setFriends(friendsData);
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

  return (
    <SafeAreaView style={{ flex: 1, gap: 20 }}>
      <Text>SingleChatScreen</Text>
      <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
        <Text>Go To Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("FriendsScreen")}>
        <Text>Friends</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SingleChatScreen;

const styles = StyleSheet.create({});
