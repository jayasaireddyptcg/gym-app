import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "./types";
import AuthNavigator from "./AuthNavigator";
import MainTabs from "./MainTabs";
import EquipmentResultScreen from "../screens/EquipmentResultScreen";
import EquipmentScanScreen from "../screens/EquipmentScanScreen";
import FoodScanScreen from "../screens/FoodScanScreen";
import FoodResultScreen from "../screens/FoodResultScreen";
import ExerciseListScreen from "../screens/ExerciseListScreen";
import ExerciseDetailScreen from "../screens/ExerciseDetailScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import StepCounterScreen from "../screens/StepCounterScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("ROOT AUTH STATE:", isAuthenticated);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="EquipmentScan" component={EquipmentScanScreen} />
      <Stack.Screen name="EquipmentResult" component={EquipmentResultScreen} />
      <Stack.Screen name="FoodScan" component={FoodScanScreen} />
      <Stack.Screen name="FoodResult" component={FoodResultScreen} />
      <Stack.Screen name="ExerciseList" component={ExerciseListScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="StepCounter" component={StepCounterScreen} />
    </Stack.Navigator>
  );
}
