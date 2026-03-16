import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { apiService, LoginRequest } from "../services/api";

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp =
  NativeStackNavigationProp<AuthStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const loginData: LoginRequest = { email, password };
      await apiService.login(loginData);
      console.log("SETTING AUTH TRUE");
      setAuthenticated(true);
    } catch (e: any) {
      Alert.alert("Login Failed", e.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigation.navigate("Signup");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero Image */}
        <View style={styles.heroWrapper}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="mail-outline"
              size={20}
              color={colors.muted}
            />
            <TextInput
              placeholder="name@example.com"
              placeholderTextColor={colors.muted}
              style={styles.input}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.field}>
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="lock-outline"
              size={20}
              color={colors.muted}
            />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
            <MaterialIcons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text style={styles.join} onPress={handleSignup}>
              Join now
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  heroWrapper: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  heroImage: {
    width: "150%",
    height: 260,
    borderRadius: 24,
  },
  title: {
    ...typography.title,
    textAlign: "center",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    color: colors.muted,
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  forgot: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    color: colors.primary,
  },
  actions: {
    marginTop: spacing.xl,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  loginText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  footer: {
    marginTop: "auto",
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: colors.muted,
  },
  join: {
    color: colors.accent,
    fontWeight: "700",
  },
});
