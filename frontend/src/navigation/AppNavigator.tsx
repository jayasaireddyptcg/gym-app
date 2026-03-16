import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import EquipmentResultScreen from "../screens/EquipmentResultScreen";
import EquipmentScanScreen from "../screens/EquipmentScanScreen";
import FoodScanScreen from "../screens/FoodScanScreen";
import FoodResultScreen from "../screens/FoodResultScreen";
import ExerciseListScreen from "../screens/ExerciseListScreen";
import ExerciseDetailScreen from "../screens/ExerciseDetailScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import MainTabs from "./MainTabs";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Auth */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPasswordScreen}
        options={{ gestureEnabled: false }}
      />

      {/* Main App (Tabs) */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{ gestureEnabled: false }}
      />

      {/* Flow / Detail Screens */}
      <Stack.Screen
        name="EquipmentScan"
        component={EquipmentScanScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="EquipmentResult"
        component={EquipmentResultScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="FoodScan"
        component={FoodScanScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="FoodResult"
        component={FoodResultScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="ExerciseList"
        component={ExerciseListScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
