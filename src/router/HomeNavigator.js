import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import FriendRequestsScreen from "../screens/FriendRequestsScreen";
import FriendsScreen from "../screens/FriendsScreen";

const Tab = createBottomTabNavigator();

const HomeNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      <Tab.Screen
        name="FriendRequestsScreen"
        component={FriendRequestsScreen}
      />
      <Tab.Screen name="FriendsScreen" component={FriendsScreen} />
    </Tab.Navigator>
  );
};

export default HomeNavigator;

const styles = StyleSheet.create({});
