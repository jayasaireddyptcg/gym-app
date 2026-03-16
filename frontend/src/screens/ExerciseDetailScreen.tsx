import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type NavItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
};

type Exercise = {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  muscle: string;
  icon: string;
};

// Generic exercise details template for exercises not in the detailed database
const getGenericExerciseDetails = (exerciseName: string, muscle: string, level: string, equipment: string) => {
  return {
    description: `The ${exerciseName} is an effective exercise targeting the ${muscle.toLowerCase()}. This movement helps build strength and muscle development using ${equipment.toLowerCase()}. Proper form is essential for maximizing results and preventing injury.`,
    variations: [
      { title: "Standard Variation", desc: `The basic form of ${exerciseName} with standard technique.` },
      { title: "Advanced Variation", desc: `Progressed version of ${exerciseName} for experienced lifters.` },
      { title: "Modified Variation", desc: `Adapted form of ${exerciseName} for different muscle targeting.` },
    ],
    tips: [
      "Focus on proper form before increasing weight.",
      "Control the movement through full range of motion.",
      "Maintain consistent breathing throughout the exercise.",
      "Start with lighter weight to master the technique.",
    ],
    equipment: equipment
  };
};

type RouteParams = {
  exercise?: string;
  muscle?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  equipment?: string;
};

export default function ExerciseDetailScreen() {
  const route = useRoute();
  const params = (route.params as RouteParams) || {};
  const exerciseName = params.exercise || "Dumbbell Goblet Squat";
  const exerciseMuscle = params.muscle || "Quadriceps";
  const exerciseLevel = params.level || "Intermediate";
  const exerciseEquipment = params.equipment || "Dumbbells";
  
  // Try to get detailed exercise info, fallback to generic template
  const exerciseDetails = getGenericExerciseDetails(exerciseName, exerciseMuscle, exerciseLevel, exerciseEquipment);
  
  // Get exercise icon from the exercise name
  const getExerciseIcon = (name: string): keyof typeof MaterialIcons.glyphMap => {
    const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
      "Bicep Curls": "fitness-center",
      "Barbell Squat": "directions-run",
      "Leg Press": "fitness-center",
      "Bench Press": "fitness-center",
      "Lat Pulldown": "view-agenda",
      "Treadmill Running": "directions-run",
      "Kettlebell Swing": "sports-gymnastics",
      "Dumbbell Goblet Squat": "fitness-center",
    };
    return iconMap[name] || "fitness-center";
  };

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Exercise Detail</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero Image */}
        <ImageBackground
          source={{
            uri: exerciseName.includes("Squat") 
              ? "https://images.unsplash.com/photo-1599058917212-d750089bc07b"
              : exerciseName.includes("Bench")
              ? "https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
              : "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
          }}
          style={styles.image}
          imageStyle={styles.imageRadius}
        />

        {/* Title */}
        <Text style={styles.title}>{exerciseName}</Text>

        {/* Tags */}
        <View style={styles.tags}>
          <View style={styles.tag}>
            <MaterialIcons name={getExerciseIcon(exerciseName)} size={14} color={colors.primary} />
            <Text style={styles.tagText}>{exerciseDetails.equipment}</Text>
          </View>

          <View style={styles.tag}>
            <MaterialIcons name="directions-run" size={14} color={colors.primary} />
            <Text style={styles.tagText}>{exerciseMuscle}</Text>
          </View>

          <View style={styles.tag}>
            <MaterialIcons name="speed" size={14} color={colors.primary} />
            <Text style={styles.tagText}>{exerciseLevel}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.section}>Description</Text>
        <Text style={styles.description}>
          {exerciseDetails.description}
        </Text>

        {/* Variations */}
        <Text style={styles.section}>Variations</Text>

        {exerciseDetails.variations.map((variation: { title: string; desc: string }) => (
          <View key={variation.title} style={styles.variation}>
            <View style={styles.check}>
              <MaterialIcons name="check" size={12} color="#000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.variationTitle}>{variation.title}</Text>
              <Text style={styles.variationText}>{variation.desc}</Text>
            </View>
          </View>
        ))}

        {/* Tips */}
        <View style={styles.tips}>
          <View style={styles.tipsHeader}>
            <MaterialIcons name="lightbulb" size={20} color={colors.accent} />
            <Text style={styles.tipsTitle}>Expert Tips & Notes</Text>
          </View>

          {exerciseDetails.tips.map((tip: string, index: number) => (
            <Text key={index} style={styles.tipItem}>
              • {tip}
            </Text>
          ))}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  content: {
    paddingBottom: 140,
  },
  image: {
    height: 300,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  imageRadius: {
    borderRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    color: colors.primary,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: `${colors.accent}22`,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  section: {
    ...typography.section,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    color: colors.primary,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    color: "#3A4F41",
  },
  variation: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  variationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  variationText: {
    fontSize: 13,
    color: "#3A4F41",
    marginTop: 2,
  },
  tips: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: `${colors.accent}1A`,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.accent,
  },
  tipItem: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
