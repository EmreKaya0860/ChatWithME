import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet } from "react-native";
import FriendsScreen from "../screens/FriendsScreen";
import GroupChatScreen from "../screens/GroupChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SingleChatScreen from "../screens/SingleChatScreen";

const Tab = createBottomTabNavigator();

const HomeNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "SingleChatScreen") {
            iconName = "chatbubble";
          } else if (route.name === "GroupChatScreen") {
            iconName = "chatbubbles";
          } else if (route.name === "FriendsScreen") {
            iconName = "users";
          } else if (route.name === "ProfileScreen") {
            iconName = "user-edit";
          }

          if (iconName.startsWith("chat")) {
            return <Ionicons name={iconName} size={size} color={color} />;
          } else {
            return <FontAwesome5 name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#bb86fc",
        tabBarInactiveTintColor: "#aaa",
      })}
    >
      <Tab.Screen name="SingleChatScreen" component={SingleChatScreen} />
      <Tab.Screen name="GroupChatScreen" component={GroupChatScreen} />
      <Tab.Screen name="FriendsScreen" component={FriendsScreen} />
      <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default HomeNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#1e1e1e",
    borderTopColor: "#2e2e2e",
    height: 60,
    paddingBottom: 10,
  },
});
