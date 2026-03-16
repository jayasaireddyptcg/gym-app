import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

import HomeScreen from "../screens/HomeScreen";
import EquipmentScanScreen from "../screens/EquipmentScanScreen";
import FoodScanScreen from "../screens/FoodScanScreen";
import ExerciseListScreen from "../screens/ExerciseListScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StepCounterScreen from "../screens/StepCounterScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#ffffffee",
          borderTopColor: "#E5E7EB",
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon: keyof typeof MaterialIcons.glyphMap = "home";

          if (route.name === "Explore") icon = "home";
          if (route.name === "Scan") icon = "qr-code-scanner";
          if (route.name === "Food") icon = "restaurant";
          if (route.name === "Steps") icon = "directions-walk";
          if (route.name === "Profile") icon = "person";

          return (
            <MaterialIcons
              name={icon}
              size={focused ? 26 : 24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Explore" component={HomeScreen} />
      <Tab.Screen name="Scan" component={EquipmentScanScreen} />
      <Tab.Screen name="Food" component={FoodScanScreen} />
      <Tab.Screen name="Steps" component={StepCounterScreen} />
      <Tab.Screen name="Profile" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
