import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { apiService, API_URL, UserProfile } from "../services/api";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useAuth } from "../context/AuthContext";

type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  EditProfile: undefined;
};

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;


export default function EditProfileScreen() {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { setAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "https://images.unsplash.com/photo-1594737625785-cf4d4d1d2d3d",
  });

  const [originalEmail, setOriginalEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getProfile();
        const email = data.email;
        setProfile({
          name: data.name || "",
          email: email,
          phone: data.phone || "",
          bio: data.bio || "",
          avatar: data.avatar || "https://images.unsplash.com/photo-1594737625785-cf4d4d1d2d3d",
        });
        setOriginalEmail(email);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to load profile");
      }
    })();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setProfile({ ...profile, email: text });
    setEmailError("");
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.logout();
              setAuthenticated(false);
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  const uploadAvatar = async (uri: string, token: string) => {
    const form = new FormData();

    form.append("file", {
      uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as any);

    const res = await fetch(`${API_URL}/uploads/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      body: form,
    });

    return await res.json();
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please grant camera roll permissions to change your avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const token = await SecureStore.getItemAsync("access_token");
        
        if (!token) {
          Alert.alert("Error", "You are not authenticated. Please login again.");
          return;
        }

        try {
          const response = await uploadAvatar(result.assets[0].uri, token);
          
          if (response.avatar_url) {
            setProfile({ ...profile, avatar: response.avatar_url });
            Alert.alert("Success", "Avatar updated successfully!");
          } else {
            Alert.alert("Error", response.message || "Failed to upload avatar.");
          }
        } catch (error) {
          Alert.alert("Error", "Failed to upload avatar. Please try again.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!profile.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    
    if (!profile.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!validateEmail(profile.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      const cleanedProfile = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone?.trim() || undefined,
        bio: profile.bio?.trim() || undefined,
        avatar: profile.avatar || undefined,
      };
      
      await apiService.updateProfile(cleanedProfile);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error: any) {
      if (error.message.includes("already linked to another account")) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", error.message || "Failed to update profile");
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
    // Navigate back to profile screen
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <MaterialIcons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatar} onPress={handleImagePicker}>
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.changeAvatarButton} onPress={handleImagePicker}>
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              value={profile.email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone (Optional)</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="Enter your phone number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          {/* Bio */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              placeholder="Tell us about yourself"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.options}>
          <TouchableOpacity style={styles.optionButton} onPress={() => (navigation as any).navigate('ChangePassword')}>
            <MaterialIcons name="lock" size={20} color={colors.primary} />
            <Text style={styles.optionText}>Change Password</Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

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
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "#ffffffee",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.accent,
  },
  content: {
    paddingBottom: 80,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    backgroundColor: "#fff",
    marginBottom: spacing.lg,
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
  changeAvatarButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.accent}22`,
    borderRadius: 999,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
  },
  form: {
    backgroundColor: "#fff",
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.primary,
    backgroundColor: "#FAFBFC",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.sm,
  },
  options: {
    backgroundColor: "#fff",
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
    marginLeft: spacing.md,
  },
});
