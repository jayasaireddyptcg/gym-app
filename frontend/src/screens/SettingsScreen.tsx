import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Alert } from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { apiService, UserProfile } from "../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useAuth } from "../context/AuthContext";


export default function SettingsScreen() {
  const navigation = useNavigation();
  const { setAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    avatar: "https://images.unsplash.com/photo-1594737625785-cf4d4d1d2d3d",
  });

  const isFocused = useIsFocused();

  const loadProfile = async () => {
    try {
      const data = await apiService.getProfile();
      setProfile({
        name: data.name || "",
        email: data.email,
        avatar: data.avatar || "https://images.unsplash.com/photo-1594737625785-cf4d4d1d2d3d",
      });
    } catch (err: any) {
      // Handle profile fetch error silently
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadProfile();
    }
  }, [isFocused]);

  const handleLegal = (title: string) => {
    Alert.alert(title, `${title} information coming soon.`);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setAuthenticated(false);
    } catch (err) {
      // Handle logout error silently
    }
  };

  const handleEditProfile = () => {
    (navigation as any).navigate('EditProfile');
  };
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile */}
        <View style={styles.profile}>
          <View style={styles.avatarWrap}>
            <Image
              source={{
                uri: profile.avatar,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatar} onPress={handleEditProfile}>
              <MaterialIcons name="edit" size={16} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>
            {profile.name || "Set up your profile"}
          </Text>
          <Text style={styles.email}>
            {profile.email || "Add your email"}
          </Text>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingRow icon="person" label="Edit Profile" onPress={handleEditProfile} />
        </View>

        {/* Support & Legal */}
        <Text style={styles.sectionLabel}>SUPPORT & LEGAL</Text>
        <View style={styles.card}>
          <SettingRow icon="description" label="Terms of Service" onPress={() => handleLegal('Terms of Service')} />
          <Divider />
          <SettingRow icon="shield" label="Privacy Policy" onPress={() => handleLegal('Privacy Policy')} />
          <Divider />
          <SettingRow icon="verified-user" label="Third-Party Licenses" onPress={() => handleLegal('Third-Party Licenses')} />
        </View>

        {/* App */}
        <Text style={styles.sectionLabel}>APPLICATION</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <MaterialIcons name="info" size={20} color={colors.primary} />
              </View>
              <Text style={styles.rowText}>App Version</Text>
            </View>
            <Text style={styles.version}>v1.0.0 (24)</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#000" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Reusable ---------- */

function SettingRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "#ffffffee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  content: {
    paddingBottom: 80,
  },
  profile: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: `${colors.accent}33`,
  },
  editAvatar: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: colors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
  },
  email: {
    fontSize: 15,
    color: colors.accent,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#6B7280",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    height: 64,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.accent}1A`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  rowText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
  version: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  footer: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.accent,
    letterSpacing: -0.5,
  },
  madeWith: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
    fontWeight: "500",
  },
});
