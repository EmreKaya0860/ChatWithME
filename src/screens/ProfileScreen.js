import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";

import { getUserData } from "../services/firestore";
import { auth } from "../services/authentication";

import { SafeAreaView } from "react-native-safe-area-context";

import LoadingIndicator from "../Components/LoadingIndicator";

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUserData(auth.currentUser.uid);
      if (data) {
        setUserData(data);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>ProfileScreen</Text>
      {!isLoading ? (
        userData.map((item, index) => (
          <View key={index}>
            <Text>{item.displayName}</Text>
            <Text>{item.profileImage}</Text>
            <Text>{item.email}</Text>
          </View>
        ))
      ) : (
        <LoadingIndicator visible={isLoading} />
      )}
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
