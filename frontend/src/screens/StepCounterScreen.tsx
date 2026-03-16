import React from 'react';
import { View, StyleSheet, StatusBar, Text, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import StepCounter from '../components/StepCounter'; // Keep your existing component
import { colors } from '../theme/colors'; // Keep your existing theme
import { useStepTracking } from '../hooks/useStepTracking'; // Keep your existing hook

const { width } = Dimensions.get('window');

// Configuration for the Ring
const RING_SIZE = 220;
const STROKE_WIDTH = 15;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StepCounterScreen() {
  const { stepData, updateStepData } = useStepTracking();

  // Calculate Progress (0 to 1)
  // Ensure we don't divide by zero and cap it at 1 (100%) for the ring visual
  const progress = stepData.goal > 0 ? stepData.steps / stepData.goal : 0;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - clampedProgress);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerDate}>Today</Text>
          <Text style={styles.headerSubtitle}>Keep moving forward!</Text>
        </View>

        {/* HERO SECTION: Single Real Ring */}
        {/* Shows Steps ONLY here to avoid duplication */}
        <View style={styles.activitySection}>
          <View style={{ width: RING_SIZE, height: RING_SIZE, justifyContent: 'center', alignItems: 'center' }}>
            <Svg height={RING_SIZE} width={RING_SIZE}>
              {/* Background Track Ring */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={colors.border || '#E0E0E0'}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              {/* Foreground Progress Ring */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={colors.accent || '#10B981'} // Single Color
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            
            {/* Center Content */}
            <View style={styles.centerContent}>
              <MaterialIcons name="directions-walk" size={32} color={colors.accent} style={{ marginBottom: 4 }} />
              <Text style={styles.stepsNumber}>{stepData.steps.toLocaleString()}</Text>
              <Text style={styles.stepsLabel}>STEPS</Text>
              <Text style={styles.goalLabel}>Goal: {stepData.goal.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Hidden StepCounter for data collection logic */}
        <StepCounter onStepUpdate={updateStepData} />

        {/* STATS GRID: Secondary Metrics Only */}
        {/* REMOVED: Steps Card (Already in Hero) */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.statsGrid}>
            
            {/* Card 1: Calories */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <MaterialIcons name="local-fire-department" size={20} color={colors.danger} />
                <Text style={styles.statLabel}>CALORIES</Text>
              </View>
              <Text style={styles.statValue}>{stepData.calories}</Text>
              <Text style={styles.statUnit}>kcal</Text>
            </View>

            {/* Card 2: Distance */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <MaterialIcons name="location-on" size={20} color="#4F46E5" />
                <Text style={styles.statLabel}>DISTANCE</Text>
              </View>
              <Text style={styles.statValue}>{stepData.distance}</Text>
              <Text style={styles.statUnit}>miles</Text>
            </View>

            {/* Card 3: Flights */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <MaterialIcons name="stairs" size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>FLIGHTS</Text>
              </View>
              <Text style={styles.statValue}>{stepData.flights}</Text>
              <Text style={styles.statUnit}>floors</Text>
            </View>

             {/* Placeholder for symmetry or 4th metric if needed */}
             {/* If you only have 3 metrics, you can make the cards width: '30%' or keep 48% and have one empty/promo space */}
            
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerDate: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.muted,
    marginTop: 4,
    fontWeight: '500',
  },
  activitySection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 50,
  },
  stepsLabel: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  goalLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    opacity: 0.8,
  },
  statsSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%', // Fits 2 per row
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    // Modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  statUnit: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 2,
  },
});