import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "./types";
import { HomeScreen } from "../screens/HomeScreen";
import { StoryDetailScreen } from "../screens/StoryDetailScreen";
import { StoryRevealScreen } from "../screens/StoryRevealScreen";
import { JoinSessionScreen } from "../screens/JoinSessionScreen";
import { MemoriesScreen } from "../screens/MemoriesScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TemplateSelectionScreen } from "../screens/TemplateSelectionScreen";
import { BranchComparisonScreen } from "../screens/BranchComparisonScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#D4A5A5",
        tabBarInactiveTintColor: "#A0886C",
        tabBarStyle: {
          backgroundColor: "#FFF8F0",
          borderTopColor: "#E8D5C4",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Stories"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MemoriesTab"
        component={MemoriesScreen}
        options={{
          tabBarLabel: "Memories",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFF8F0" },
      }}
    >
      <Stack.Screen name="Home" component={HomeTabs} />
      <Stack.Screen name="TemplateSelection" component={TemplateSelectionScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
      <Stack.Screen
        name="StoryReveal"
        component={StoryRevealScreen}
        options={{
          presentation: "modal",
          animation: "fade",
        }}
      />
      <Stack.Screen name="JoinSession" component={JoinSessionScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="BranchComparison" component={BranchComparisonScreen} />
    </Stack.Navigator>
  );
}
