import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
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
import { apiService, SignupRequest } from "../services/api";

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  MainTabs: undefined;
};

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { setAuthenticated } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const signupData: SignupRequest = { email, password, name: fullName };
      await apiService.signup(signupData);
      setAuthenticated(true);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleTermsPress = () => {
    Alert.alert('Terms of Service', 'Coming Soon! Our Terms of Service will be available soon.');
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy Policy', 'Coming Soon! Our Privacy Policy will be available soon.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToLogin}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroWrapper}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join FitScan to start your fitness journey</Text>

        {/* Full Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="person-outline"
              size={20}
              color={colors.muted}
            />
            <TextInput
              placeholder="John Doe"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

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
          <Text style={styles.label}>Password</Text>
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

        {/* Confirm Password */}
        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
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
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsWrapper}>
          <TouchableOpacity style={styles.checkbox}>
            <View style={styles.checkboxInner}>
              <MaterialIcons name="check" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the{" "}
            <TouchableOpacity onPress={handleTermsPress}>
              <Text style={styles.termsLink}>Terms of Service</Text>
            </TouchableOpacity> and{" "}
            <TouchableOpacity onPress={handlePrivacyPress}>
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </TouchableOpacity>
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
            <Text style={styles.signupText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.signIn}>Sign in</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
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
    width: "100%",
    height: 200,
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
  termsWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  checkbox: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxInner: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.accent,
    fontWeight: "500",
  },
  actions: {
    marginTop: spacing.xl,
  },
  signupButton: {
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
  signupText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: colors.muted,
  },
  signIn: {
    color: colors.accent,
    fontWeight: "700",
  },
});
