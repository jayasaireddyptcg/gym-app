import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("AUTH STATE CHANGED:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    </Stack.Navigator>
  );
}
