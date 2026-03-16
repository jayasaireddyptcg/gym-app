import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Level = "Beginner" | "Intermediate" | "Advanced";
type Exercise = {
  name: string;
  level: Level;
  muscle: string;
  icon: string;
};

const LEVEL_STYLE: Record<
  Level,
  { bg: string; text: string }
> = {
  Beginner: { bg: `${colors.accent}22`, text: colors.primary },
  Intermediate: { bg: "#FDE68A66", text: "#92400E" },
  Advanced: { bg: "#FCA5A566", text: "#7F1D1D" },
};

// Comprehensive exercise database by equipment
const EXERCISE_DATABASE: Record<string, Exercise[]> = {
  dumbbells: [
    { name: "Bicep Curls", level: "Beginner" as Level, muscle: "Arms", icon: "fitness-center" },
    { name: "Hammer Curls", level: "Beginner" as Level, muscle: "Arms", icon: "fitness-center" },
    { name: "Concentration Curls", level: "Intermediate" as Level, muscle: "Arms", icon: "fitness-center" },
    { name: "Incline Dumbbell Curl", level: "Intermediate" as Level, muscle: "Arms", icon: "fitness-center" },
    { name: "Zottman Curl", level: "Advanced" as Level, muscle: "Forearms", icon: "fitness-center" },

    { name: "Dumbbell Squat", level: "Beginner" as Level, muscle: "Legs", icon: "directions-run" },
    { name: "Goblet Squat", level: "Beginner" as Level, muscle: "Legs", icon: "directions-run" },
    { name: "Split Squat", level: "Intermediate" as Level, muscle: "Legs", icon: "directions-run" },
    { name: "Bulgarian Split Squat", level: "Advanced" as Level, muscle: "Legs", icon: "directions-run" },

    { name: "Dumbbell Bench Press", level: "Beginner" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Incline Dumbbell Press", level: "Intermediate" as Level, muscle: "Chest", icon: "trending-up" },
    { name: "Decline Dumbbell Press", level: "Intermediate" as Level, muscle: "Chest", icon: "trending-down" },
    { name: "Single Arm Dumbbell Press", level: "Advanced" as Level, muscle: "Chest", icon: "fitness-center" },

    { name: "Lateral Raises", level: "Beginner" as Level, muscle: "Shoulders", icon: "accessibility-new" },
    { name: "Front Raises", level: "Beginner" as Level, muscle: "Shoulders", icon: "trending-up" },
    { name: "Arnold Press", level: "Advanced" as Level, muscle: "Shoulders", icon: "fitness-center" },

    { name: "Dumbbell Rows", level: "Beginner" as Level, muscle: "Back", icon: "view-agenda" },
    { name: "Renegade Row", level: "Advanced" as Level, muscle: "Full Body", icon: "view-agenda" },

    { name: "Romanian Deadlift", level: "Intermediate" as Level, muscle: "Hamstrings", icon: "align-vertical-bottom" },
    { name: "Single Leg RDL", level: "Advanced" as Level, muscle: "Hamstrings", icon: "align-vertical-bottom" },

    { name: "Dumbbell Snatch", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
  ],
  barbell: [
    { name: "Barbell Squat", level: "Beginner" as Level, muscle: "Legs", icon: "directions-run" },
    { name: "Pause Squat", level: "Intermediate" as Level, muscle: "Legs", icon: "timer" },
    { name: "Box Squat", level: "Advanced" as Level, muscle: "Legs", icon: "directions-run" },

    { name: "Bench Press", level: "Beginner" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Close Grip Bench Press", level: "Intermediate" as Level, muscle: "Triceps", icon: "fitness-center" },
    { name: "Spoto Press", level: "Advanced" as Level, muscle: "Chest", icon: "timer" },

    { name: "Deadlift", level: "Intermediate" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Sumo Deadlift", level: "Intermediate" as Level, muscle: "Legs", icon: "sports-gymnastics" },
    { name: "Deficit Deadlift", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },

    { name: "Overhead Press", level: "Beginner" as Level, muscle: "Shoulders", icon: "fitness-center" },
    { name: "Push Press", level: "Intermediate" as Level, muscle: "Shoulders", icon: "fitness-center" },

    { name: "Barbell Row", level: "Beginner" as Level, muscle: "Back", icon: "view-agenda" },
    { name: "Pendlay Row", level: "Advanced" as Level, muscle: "Back", icon: "view-agenda" },

    { name: "Power Clean", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
  ],
  "leg-press": [
    { name: "Leg Press", level: "Beginner" as Level, muscle: "Quadriceps", icon: "directions-run" },
    { name: "Single Leg Press", level: "Intermediate" as Level, muscle: "Quadriceps", icon: "directions-run" },
    { name: "Wide Stance Press", level: "Intermediate" as Level, muscle: "Glutes", icon: "directions-run" },
    { name: "Calf Raises", level: "Beginner" as Level, muscle: "Calves", icon: "directions-run" },
    { name: "Drop Sets", level: "Advanced" as Level, muscle: "Legs", icon: "fitness-center" },
    { name: "Tempo Leg Press", level: "Intermediate" as Level, muscle: "Legs", icon: "timer" },
    { name: "High Foot Placement Press", level: "Intermediate" as Level, muscle: "Glutes", icon: "trending-up" },
  ],
  treadmill: [
    { name: "Walking", level: "Beginner" as Level, muscle: "Cardio", icon: "directions-run" },
    { name: "Jogging", level: "Beginner" as Level, muscle: "Cardio", icon: "directions-run" },
    { name: "Incline Walking", level: "Beginner" as Level, muscle: "Glutes", icon: "trending-up" },
    { name: "Interval Training", level: "Intermediate" as Level, muscle: "Cardio", icon: "timer" },
    { name: "Hill Intervals", level: "Intermediate" as Level, muscle: "Legs", icon: "trending-up" },
    { name: "Sprint Intervals", level: "Advanced" as Level, muscle: "Cardio", icon: "directions-run" },
    { name: "HIIT Sprints", level: "Advanced" as Level, muscle: "Cardio", icon: "timer" },
  ],
  elliptical: [
    { name: "Low Impact Cardio", level: "Beginner" as Level, muscle: "Cardio", icon: "directions-bike" },
    { name: "Forward Motion", level: "Beginner" as Level, muscle: "Full Body", icon: "sync" },
    { name: "Backward Motion", level: "Intermediate" as Level, muscle: "Hamstrings", icon: "replay" },
    { name: "High Resistance", level: "Advanced" as Level, muscle: "Full Body", icon: "fitness-center" },
    { name: "Upper Body Focus", level: "Intermediate" as Level, muscle: "Full Body", icon: "sync" },
    { name: "HIIT Sprints", level: "Advanced" as Level, muscle: "Cardio", icon: "timer" },
  ],
  "stationary-bike": [
    { name: "Steady State", level: "Beginner" as Level, muscle: "Cardio", icon: "directions-bike" },
    { name: "HIIT Intervals", level: "Intermediate" as Level, muscle: "Cardio", icon: "timer" },
    { name: "Hill Climb", level: "Intermediate" as Level, muscle: "Legs", icon: "trending-up" },
    { name: "Sprint Training", level: "Advanced" as Level, muscle: "Cardio", icon: "directions-bike" },
    { name: "Recovery Ride", level: "Beginner" as Level, muscle: "Cardio", icon: "directions-bike" },
    { name: "Standing Climb", level: "Advanced" as Level, muscle: "Legs", icon: "trending-up" },
  ],
  "cable-machine": [
    { name: "Cable Chest Fly", level: "Beginner" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Tricep Pushdown", level: "Beginner" as Level, muscle: "Arms", icon: "fitness-center" },
    { name: "Lat Pulldown", level: "Intermediate" as Level, muscle: "Back", icon: "view-agenda" },
    { name: "Cable Row", level: "Intermediate" as Level, muscle: "Back", icon: "view-agenda" },
    { name: "Face Pulls", level: "Intermediate" as Level, muscle: "Shoulders", icon: "accessibility-new" },
    { name: "Cable Crunches", level: "Advanced" as Level, muscle: "Core", icon: "fitness-center" },
  ],
  "smith-machine": [
    { name: "Smith Squat", level: "Beginner" as Level, muscle: "Legs", icon: "directions-run" },
    { name: "Smith Bench Press", level: "Beginner" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Smith Shoulder Press", level: "Intermediate" as Level, muscle: "Shoulders", icon: "fitness-center" },
    { name: "Smith Deadlift", level: "Intermediate" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Smith Lunges", level: "Advanced" as Level, muscle: "Legs", icon: "directions-run" },
    { name: "Smith Calf Raises", level: "Beginner" as Level, muscle: "Calves", icon: "directions-run" },
    { name: "Smith Hip Thrust", level: "Intermediate" as Level, muscle: "Glutes", icon: "fitness-center" },
  ],
  "pull-up-bar": [
    { name: "Assisted Pull-ups", level: "Beginner" as Level, muscle: "Back", icon: "view-agenda" },
    { name: "Chin-ups", level: "Intermediate" as Level, muscle: "Arms", icon: "fitness-center" },
    { name: "Wide Grip Pull-ups", level: "Advanced" as Level, muscle: "Back", icon: "view-agenda" },
    { name: "Hanging Leg Raises", level: "Intermediate" as Level, muscle: "Core", icon: "fitness-center" },
    { name: "Muscle-ups", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Dead Hang", level: "Beginner" as Level, muscle: "Grip", icon: "fitness-center" },
    { name: "Isometric Holds", level: "Intermediate" as Level, muscle: "Back", icon: "timer" },
  ],
  "chest-press": [
    { name: "Chest Press", level: "Beginner" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Incline Press", level: "Intermediate" as Level, muscle: "Upper Chest", icon: "trending-up" },
    { name: "Decline Press", level: "Intermediate" as Level, muscle: "Lower Chest", icon: "trending-down" },
    { name: "Single Arm Press", level: "Advanced" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Pause Reps", level: "Advanced" as Level, muscle: "Chest", icon: "timer" },
    { name: "Tempo Press", level: "Advanced" as Level, muscle: "Chest", icon: "timer" },
  ],
  "shoulder-press": [
    { name: "Shoulder Press", level: "Beginner" as Level, muscle: "Shoulders", icon: "fitness-center" },
    { name: "Lateral Raises", level: "Beginner" as Level, muscle: "Shoulders", icon: "accessibility-new" },
    { name: "Front Raises", level: "Intermediate" as Level, muscle: "Front Delts", icon: "trending-up" },
    { name: "Reverse Fly", level: "Intermediate" as Level, muscle: "Rear Delts", icon: "replay" },
    { name: "Arnold Press", level: "Advanced" as Level, muscle: "Shoulders", icon: "fitness-center" },
  ],
  "lat-pulldown": [
    { name: "Lat Pulldown", level: "Beginner" as Level, muscle: "Back", icon: "view-agenda" },
    { name: "Wide Grip Pulldown", level: "Intermediate" as Level, muscle: "Lats", icon: "view-agenda" },
    { name: "Close Grip Pulldown", level: "Intermediate" as Level, muscle: "Mid Back", icon: "view-agenda" },
    { name: "Reverse Grip Pulldown", level: "Advanced" as Level, muscle: "Biceps", icon: "fitness-center" },
    { name: "Drop Sets", level: "Advanced" as Level, muscle: "Back", icon: "fitness-center" },
    { name: "Single Arm Pulldown", level: "Intermediate" as Level, muscle: "Back", icon: "view-agenda" },
  ],
  "leg-extension": [
    { name: "Leg Extensions", level: "Beginner" as Level, muscle: "Quadriceps", icon: "directions-run" },
    { name: "Single Leg Extensions", level: "Intermediate" as Level, muscle: "Quadriceps", icon: "directions-run" },
    { name: "Pause Reps", level: "Intermediate" as Level, muscle: "Quadriceps", icon: "timer" },
    { name: "Partial Reps", level: "Advanced" as Level, muscle: "Quadriceps", icon: "fitness-center" },
    { name: "Burnouts", level: "Advanced" as Level, muscle: "Quadriceps", icon: "fitness-center" },
    { name: "Isometric Holds", level: "Intermediate" as Level, muscle: "Quadriceps", icon: "timer" },
  ],
  "leg-curl": [
    { name: "Leg Curls", level: "Beginner" as Level, muscle: "Hamstrings", icon: "directions-run" },
    { name: "Single Leg Curls", level: "Intermediate" as Level, muscle: "Hamstrings", icon: "directions-run" },
    { name: "Seated Curls", level: "Intermediate" as Level, muscle: "Hamstrings", icon: "chair" },
    { name: "Lying Curls", level: "Advanced" as Level, muscle: "Hamstrings", icon: "hotel" },
    { name: "Negative Reps", level: "Advanced" as Level, muscle: "Hamstrings", icon: "timer" },
    { name: "Slow Eccentric Curl", level: "Advanced" as Level, muscle: "Hamstrings", icon: "timer" },
  ],
  "hip-abductor": [
    { name: "Hip Abduction", level: "Beginner" as Level, muscle: "Outer Thighs", icon: "directions-run" },
    { name: "Hip Adduction", level: "Beginner" as Level, muscle: "Inner Thighs", icon: "directions-run" },
    { name: "Pulse Reps", level: "Intermediate" as Level, muscle: "Glutes", icon: "fitness-center" },
    { name: "Isometric Holds", level: "Advanced" as Level, muscle: "Hips", icon: "timer" },
    { name: "Drop Sets", level: "Advanced" as Level, muscle: "Outer Thighs", icon: "fitness-center" },
    { name: "Extended Range Reps", level: "Intermediate" as Level, muscle: "Glutes", icon: "fitness-center" },
  ],
  "rowing-machine": [
    { name: "Rowing", level: "Beginner" as Level, muscle: "Full Body", icon: "rowing" },
    { name: "Steady State", level: "Beginner" as Level, muscle: "Cardio", icon: "timer" },
    { name: "HIIT Intervals", level: "Intermediate" as Level, muscle: "Cardio", icon: "timer" },
    { name: "Power Strokes", level: "Advanced" as Level, muscle: "Back", icon: "fitness-center" },
    { name: "Endurance Rows", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Sprint Intervals", level: "Advanced" as Level, muscle: "Cardio", icon: "timer" },
  ],
  "stair-climber": [
    { name: "Stair Climbing", level: "Beginner" as Level, muscle: "Legs", icon: "stairs" },
    { name: "Slow Pace", level: "Beginner" as Level, muscle: "Glutes", icon: "directions-walk" },
    { name: "Interval Training", level: "Intermediate" as Level, muscle: "Cardio", icon: "timer" },
    { name: "High Knees", level: "Advanced" as Level, muscle: "Calves", icon: "directions-run" },
    { name: "Backward Climb", level: "Advanced" as Level, muscle: "Hamstrings", icon: "replay" },
    { name: "HIIT Sprints", level: "Advanced" as Level, muscle: "Cardio", icon: "timer" },
  ],
  "pec-deck": [
    { name: "Pec Deck Fly", level: "Beginner" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Reverse Pec Deck", level: "Intermediate" as Level, muscle: "Rear Delts", icon: "replay" },
    { name: "Single Arm Fly", level: "Advanced" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Pause Reps", level: "Advanced" as Level, muscle: "Chest", icon: "timer" },
    { name: "Incline Pec Deck Fly", level: "Intermediate" as Level, muscle: "Chest", icon: "trending-up" },
    { name: "Drop Sets", level: "Advanced" as Level, muscle: "Chest", icon: "fitness-center" },
  ],
  "preacher-curl": [
    { name: "Preacher Curls", level: "Beginner" as Level, muscle: "Biceps", icon: "fitness-center" },
    { name: "Close Grip Curls", level: "Intermediate" as Level, muscle: "Biceps", icon: "fitness-center" },
    { name: "Reverse Curls", level: "Intermediate" as Level, muscle: "Forearms", icon: "replay" },
    { name: "Negative Reps", level: "Advanced" as Level, muscle: "Biceps", icon: "timer" },
    { name: "21s", level: "Advanced" as Level, muscle: "Biceps", icon: "sports-gymnastics" },
    { name: "Slow Eccentric Curl", level: "Advanced" as Level, muscle: "Biceps", icon: "timer" },
  ],
  "triceps-pushdown": [
    { name: "Triceps Pushdown", level: "Beginner" as Level, muscle: "Triceps", icon: "fitness-center" },
    { name: "Rope Pushdown", level: "Intermediate" as Level, muscle: "Triceps", icon: "fitness-center" },
    { name: "Reverse Grip Pushdown", level: "Intermediate" as Level, muscle: "Triceps", icon: "replay" },
    { name: "Single Arm Pushdown", level: "Advanced" as Level, muscle: "Triceps", icon: "fitness-center" },
    { name: "Drop Sets", level: "Advanced" as Level, muscle: "Triceps", icon: "fitness-center" },
  ],
  "ab-crunch": [
    { name: "Ab Crunch", level: "Beginner" as Level, muscle: "Abs", icon: "fitness-center" },
    { name: "Oblique Crunch", level: "Intermediate" as Level, muscle: "Obliques", icon: "fitness-center" },
    { name: "Reverse Crunch", level: "Intermediate" as Level, muscle: "Lower Abs", icon: "replay" },
    { name: "Cable Crunch", level: "Advanced" as Level, muscle: "Abs", icon: "fitness-center" },
    { name: "Hanging Leg Raises", level: "Advanced" as Level, muscle: "Core", icon: "fitness-center" },
    { name: "Weighted Crunch", level: "Intermediate" as Level, muscle: "Abs", icon: "fitness-center" },
  ],
  "back-extension": [
    { name: "Back Extension", level: "Beginner" as Level, muscle: "Lower Back", icon: "fitness-center" },
    { name: "Hyperextension", level: "Intermediate" as Level, muscle: "Glutes", icon: "fitness-center" },
    { name: "Weighted Extension", level: "Advanced" as Level, muscle: "Lower Back", icon: "fitness-center" },
    { name: "Isometric Holds", level: "Advanced" as Level, muscle: "Core", icon: "timer" },
    { name: "Tempo Holds", level: "Intermediate" as Level, muscle: "Lower Back", icon: "timer" },
    { name: "Single Leg Extension", level: "Advanced" as Level, muscle: "Glutes", icon: "directions-run" },
  ],
  "dip-station": [
    { name: "Dips", level: "Beginner" as Level, muscle: "Triceps", icon: "fitness-center" },
    { name: "Assisted Dips", level: "Beginner" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Weighted Dips", level: "Intermediate" as Level, muscle: "Triceps", icon: "fitness-center" },
    { name: "Bench Dips", level: "Intermediate" as Level, muscle: "Triceps", icon: "chair" },
    { name: "Explosive Dips", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "L-Sit Dips", level: "Advanced" as Level, muscle: "Core", icon: "sports-gymnastics" },
  ],
  "kettlebell": [
    { name: "Kettlebell Swing", level: "Beginner" as Level, muscle: "Full Body", icon: "fitness-center" },
    { name: "Goblet Squat", level: "Beginner" as Level, muscle: "Legs", icon: "directions-run" },
    { name: "Turkish Get-up", level: "Intermediate" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Kettlebell Clean", level: "Intermediate" as Level, muscle: "Full Body", icon: "fitness-center" },
    { name: "Snatch", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Double Kettlebell Work", level: "Advanced" as Level, muscle: "Full Body", icon: "fitness-center" },
  ],
  "resistance-bands": [
    { name: "Band Pull-aparts", level: "Beginner" as Level, muscle: "Shoulders", icon: "fitness-center" },
    { name: "Band Squats", level: "Beginner" as Level, muscle: "Legs", icon: "directions-run" },
    { name: "Band Rows", level: "Intermediate" as Level, muscle: "Back", icon: "view-agenda" },
    { name: "Band Chest Press", level: "Intermediate" as Level, muscle: "Chest", icon: "fitness-center" },
    { name: "Band Face Pulls", level: "Advanced" as Level, muscle: "Shoulders", icon: "accessibility-new" },
    { name: "Band Good Mornings", level: "Advanced" as Level, muscle: "Hamstrings", icon: "fitness-center" },
  ],
  "medicine-ball": [
    { name: "Medicine Ball Slams", level: "Beginner" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Wall Balls", level: "Intermediate" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Russian Twists", level: "Intermediate" as Level, muscle: "Core", icon: "sync" },
    { name: "Medicine Ball Throws", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Partner Exercises", level: "Advanced" as Level, muscle: "Full Body", icon: "people" },
  ],
  "battle-ropes": [
    { name: "Wave Slams", level: "Beginner" as Level, muscle: "Full Body", icon: "fitness-center" },
    { name: "Alternating Waves", level: "Intermediate" as Level, muscle: "Arms", icon: "sync" },
    { name: "Double Waves", level: "Intermediate" as Level, muscle: "Shoulders", icon: "fitness-center" },
    { name: "Grappler Throws", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Circles", level: "Advanced" as Level, muscle: "Core", icon: "sync" },
  ],
  "punching-bag": [
    { name: "Jab Cross", level: "Beginner" as Level, muscle: "Arms", icon: "sports-gymnastics" },
    { name: "Hook Combinations", level: "Intermediate" as Level, muscle: "Core", icon: "sports-gymnastics" },
    { name: "Uppercut Drills", level: "Intermediate" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Speed Bag Work", level: "Advanced" as Level, muscle: "Shoulders", icon: "timer" },
    { name: "Heavy Bag Rounds", level: "Advanced" as Level, muscle: "Full Body", icon: "sports-gymnastics" },
    { name: "Footwork Drills", level: "Intermediate" as Level, muscle: "Cardio", icon: "directions-run" },
  ],
};

// Equipment display names
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
};

export default function ExerciseListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [equipmentType, setEquipmentType] = useState<
    keyof typeof EXERCISE_DATABASE | null
  >(null);

  useEffect(() => {
    const equipmentParam = (route.params as any)?.equipment as
      | keyof typeof EXERCISE_DATABASE
      | undefined;

    if (equipmentParam && EXERCISE_DATABASE[equipmentParam]) {
      setEquipmentType(equipmentParam);
    } else {
      setEquipmentType(null);
    }
  }, [route.params]);

  const exercises = equipmentType
    ? EXERCISE_DATABASE[equipmentType] || []
    : [];
  const equipmentName = equipmentType
    ? EQUIPMENT_NAMES[equipmentType] || "Equipment"
    : "Food Scan Placeholder";

  const handleExercisePress = (exercise: Exercise) => {
    (navigation as any).navigate('ExerciseDetail', { 
      exercise: exercise.name,
      muscle: exercise.muscle,
      level: exercise.level,
      equipment: equipmentName
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => (navigation as any).goBack()}
        >
          <MaterialIcons name="arrow-back-ios-new" size={18} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerMeta}>EQUIPMENT</Text>
          <Text style={styles.headerTitle}>{equipmentName}</Text>
        </View>
      </View>

      {!equipmentType ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="qr-code-scanner" size={36} color={colors.accent} />
          <Text style={styles.emptyTitle}>Food Scan Option</Text>
          <Text style={styles.emptyText}>
            Scan functionality will be implemented here later.
          </Text>
          <TouchableOpacity 
            style={styles.fooScanButton}
            onPress={() => {
              // Food scan placeholder - navigation will be implemented
            }}
          >
            <Text style={styles.fooScanButtonText}>Food Scan (Coming Soon)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercise Results</Text>
            <View style={styles.count}>
              <Text style={styles.countText}>{exercises.length} Found</Text>
            </View>
          </View>

          {/* List */}
          <View style={styles.list}>
            {exercises.map((ex: Exercise) => {
              const levelStyle = LEVEL_STYLE[ex.level as Level];

              return (
                <TouchableOpacity key={ex.name} style={styles.card} onPress={() => handleExercisePress(ex)}>
                  <View style={styles.iconWrap}>
                    <MaterialIcons
                      name={ex.icon as any}
                      size={22}
                      color={colors.accent}
                    />
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.exercise}>{ex.name}</Text>
                    <View style={styles.metaRow}>
                      <View
                        style={[
                          styles.level,
                          { backgroundColor: levelStyle.bg },
                        ]}
                      >
                        <Text style={[styles.levelText, { color: levelStyle.text }]}>
                          {ex.level}
                        </Text>
                      </View>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.muscle}>{ex.muscle}</Text>
                    </View>
                  </View>

                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color="#CBD5E1"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

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
    paddingVertical: spacing.md,
    backgroundColor: "#ffffffee",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerMeta: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.accent,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: 14,
    textAlign: "center",
    color: "#64748B",
  },
  content: {
    paddingBottom: 140,
  },
  filters: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filter: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  filterActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  filterActiveText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    ...typography.section,
    color: colors.primary,
  },
  count: {
    backgroundColor: `${colors.accent}22`,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: `${colors.accent}1A`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  exercise: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  level: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  dot: {
    marginHorizontal: 6,
    fontSize: 12,
    color: "#94A3B8",
  },
  muscle: {
    fontSize: 12,
    color: "#94A3B8",
  },
  fooScanButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  fooScanButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
