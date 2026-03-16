import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const EQUIPMENT_NAMES: Record<string, string> = {
  dumbbells: "Dumbbells",
  barbell: "Barbell",
  "leg-press": "Leg Press Machine",
  treadmill: "Treadmill",
  elliptical: "Elliptical",
  "stationary-bike": "Stationary Bike",
  "cable-machine": "Cable Machine",
  "smith-machine": "Smith Machine",
  "pull-up-bar": "Pull-up Bar",
  "chest-press": "Chest Press Machine",
  "shoulder-press": "Shoulder Press Machine",
  "lat-pulldown": "Lat Pulldown Machine",
  "leg-extension": "Leg Extension Machine",
  "leg-curl": "Leg Curl Machine",
  "hip-abductor": "Hip Abductor Machine",
  "rowing-machine": "Rowing Machine",
  "stair-climber": "Stair Climber",
  "pec-deck": "Pec Deck Machine",
  "preacher-curl": "Preacher Curl Bench",
  "triceps-pushdown": "Triceps Pushdown Machine",
  "ab-crunch": "Ab Crunch Machine",
  "back-extension": "Back Extension Machine",
  "dip-station": "Dip Station",
  kettlebell: "Kettlebells",
  "resistance-bands": "Resistance Bands",
  "medicine-ball": "Medicine Ball",
  "battle-ropes": "Battle Ropes",
  "punching-bag": "Punching Bag",
  unknown: "Unknown Equipment",
};

const EQUIPMENT_MUSCLES: Record<string, string[]> = {
  "leg-press": ["Quadriceps", "Glutes", "Hamstrings", "Calves"],
  treadmill: ["Cardio", "Legs"],
  elliptical: ["Cardio", "Full Body"],
  "stationary-bike": ["Cardio", "Legs"],
  "cable-machine": ["Chest", "Back", "Arms"],
  "smith-machine": ["Legs", "Chest", "Back"],
  "pull-up-bar": ["Back", "Arms", "Core"],
  "chest-press": ["Chest", "Triceps", "Shoulders"],
  "shoulder-press": ["Shoulders", "Triceps", "Upper Chest"],
  "lat-pulldown": ["Back", "Lats", "Biceps"],
  "leg-extension": ["Quadriceps"],
  "leg-curl": ["Hamstrings"],
  "hip-abductor": ["Glutes", "Outer Thighs", "Hips"],
  dumbbells: ["Arms", "Shoulders", "Chest"],
  barbell: ["Full Body", "Legs", "Back"],
  "rowing-machine": ["Back", "Cardio"],
  "stair-climber": ["Legs", "Glutes", "Cardio"],
  "pec-deck": ["Chest", "Shoulders"],
  "preacher-curl": ["Biceps", "Forearms"],
  "triceps-pushdown": ["Triceps"],
  "ab-crunch": ["Abs", "Core"],
  "back-extension": ["Lower Back", "Glutes", "Hamstrings"],
  "dip-station": ["Chest", "Triceps", "Shoulders"],
  kettlebell: ["Full Body", "Core"],
  "resistance-bands": ["Full Body", "Stability", "Mobility"],
  "medicine-ball": ["Core", "Full Body", "Power"],
  "battle-ropes": ["Arms", "Shoulders", "Core"],
  "punching-bag": ["Arms", "Core", "Cardio"],
};

export default function EquipmentResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const equipmentKey = (route.params as any)?.equipment || "unknown";
  const confidence = (route.params as any)?.confidence as number | undefined;
  const equipmentName =
    EQUIPMENT_NAMES[equipmentKey] || EQUIPMENT_NAMES.unknown;
  const muscles =
    EQUIPMENT_MUSCLES[equipmentKey] || ["Full Body", "Strength", "Stability"];
  const badgeText =
    equipmentKey === "unknown" ? "UNSURE" : "IDENTIFIED";
  const confidenceText =
    typeof confidence === "number"
      ? `Confidence ${(confidence * 100).toFixed(0)}%`
      : "Confidence unavailable";
  const description =
    equipmentKey === "unknown"
      ? "We couldn't confidently identify the equipment. Try rescanning with better lighting or a closer angle."
      : `A reliable training station built to support effective movement patterns and strength development using the ${equipmentName.toLowerCase()}.`;

  const handleViewExercises = () => {
    (navigation as any).navigate("ExerciseList", {
      equipment: equipmentKey,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Scan Result</Text>

        <TouchableOpacity>
          <MaterialIcons name="favorite-border" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1599058917212-d750089bc07b",
          }}
          style={styles.image}
          imageStyle={styles.imageRadius}
        />

        {/* Identified */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{equipmentName}</Text>

        <Text style={styles.confidence}>{confidenceText}</Text>

        {/* Description */}
        <Text style={styles.description}>{description}</Text>

        {/* Muscle Groups */}
        <Text style={styles.section}>Targeted Muscle Groups</Text>

        <View style={styles.chips}>
          {muscles.map((muscle) => (
            <View key={muscle} style={styles.chip}>
              <View style={styles.dot} />
              <Text style={styles.chipText}>{muscle}</Text>
            </View>
          ))}
        </View>

        {/* Pro Tip */}
        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <MaterialIcons name="info" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Ensure your feet are shoulder-width apart for maximum stability
              during the movement.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={handleViewExercises}>
          <Text style={styles.ctaText}>View Exercises</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#000" />
        </TouchableOpacity>

        <Text style={styles.report}>
          Not what you’re looking for?{" "}
          <Text style={styles.reportLink}>Report a mismatch</Text>
        </Text>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: 160,
  },
  image: {
    height: 320,
    marginTop: spacing.md,
    borderWidth: 4,
    borderColor: colors.accent,
  },
  imageRadius: {
    borderRadius: 24,
  },
  badge: {
    backgroundColor: `${colors.accent}22`,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: spacing.lg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.accent,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: spacing.sm,
    color: colors.primary,
  },
  confidence: {
    marginTop: spacing.xs,
    fontSize: 13,
    fontWeight: "600",
    color: `${colors.primary}99`,
  },
  description: {
    fontSize: 15,
    color: `${colors.primary}B3`,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  section: {
    ...typography.section,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.accent}1A`,
    borderColor: `${colors.accent}33`,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: spacing.sm,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  tip: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: spacing.lg,
    borderRadius: 16,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  tipIcon: {
    backgroundColor: `${colors.accent}22`,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    color: `${colors.primary}99`,
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: "#ffffffee",
  },
  cta: {
    height: 60,
    backgroundColor: colors.accent,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  report: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: spacing.md,
  },
  reportLink: {
    color: colors.accent,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
