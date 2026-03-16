import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { apiService } from "../services/api";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const [userName, setUserName] = useState("Loading...");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await apiService.getProfile();
        setUserName(profile.name || "User");
        setUserAvatar(profile.avatar || null);
      } catch (error: any) {
        Alert.alert("Error", "Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={28} color={colors.accent} />
            )}
          </View>
          <View>
            <Text style={styles.welcome}>WELCOME BACK</Text>
            <Text style={styles.name}>{userName}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Smart Scanning</Text>

        {/* Gym Equipment Card */}
        <View style={styles.card}>
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
            }}
            style={styles.image}
            imageStyle={styles.imageRadius}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.45)"]}
              style={styles.overlay}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI VISION</Text>
            </View>
          </ImageBackground>

          <View style={styles.cardBody}>
            <View style={styles.cardTitle}>
              <MaterialIcons
                name="fitness-center"
                size={22}
                color={colors.accent}
              />
              <Text style={styles.cardHeading}>Gym Equipment</Text>
            </View>
            <Text style={styles.cardText}>
              Identify machines instantly and get personalized workout tips.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("EquipmentScan")}
            >
              <MaterialIcons name="camera-alt" size={18} color="#000" />
              <Text style={styles.primaryText}>Scan Equipment</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nutrition Card */}
        <View style={styles.card}>
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
            }}
            style={styles.image}
            imageStyle={styles.imageRadius}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.45)"]}
              style={styles.overlay}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>MACRO TRACKER</Text>
            </View>
          </ImageBackground>

          <View style={styles.cardBody}>
            <View style={styles.cardTitle}>
              <MaterialIcons
                name="restaurant"
                size={22}
                color={colors.accent}
              />
              <Text style={styles.cardHeading}>Nutrition Scanner</Text>
            </View>
            <Text style={styles.cardText}>
              Track macros and nutritional data with a single snap.
            </Text>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate("FoodScan")}
            >
              <MaterialIcons name="qr-code-scanner" size={18} color="#000" />
              <Text style={styles.primaryText}>Scan Food</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.accent}22`,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  welcome: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4c9a66",
    letterSpacing: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  section: {
    ...typography.section,
    marginVertical: spacing.lg,
    color: colors.primary,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  image: {
    height: 180,
    justifyContent: "flex-end",
  },
  imageRadius: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    backgroundColor: colors.accent,
    alignSelf: "flex-start",
    margin: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#000",
  },
  cardBody: {
    padding: spacing.lg,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  cardText: {
    fontSize: 14,
    color: "#4c9a66",
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  });
