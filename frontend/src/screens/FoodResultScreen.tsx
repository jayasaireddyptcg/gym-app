import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiService, FoodScanResponse, FoodAnalysisItem } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

interface Props {
  route: {
    params: {
      scanResult: FoodScanResponse;
    };
  };
  navigation: any;
}

export default function FoodResultScreen({ route, navigation }: Props) {
  const { scanResult } = route.params;
  const { scan, analysis } = scanResult;
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToDiary = async () => {
    try {
      setIsSaving(true);
      
      // The scan is already saved to the database when it was created
      // We just need to confirm and navigate to scan food
      
      // Simulate a brief delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message briefly, then navigate to scan food
      Alert.alert(
        'Success! 🎉',
        'This meal has been saved to your nutrition diary!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('MainTabs', { screen: 'Food' }) 
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Save Failed',
        'There was an error saving to your diary. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    Alert.alert(
      'Share Results',
      'Share your nutrition analysis with friends!',
      [{ text: 'Cancel' }, { text: 'Share' }]
    );
  };

  const renderNutrientCard = (title: string, value: number, unit: string, color: string, icon: string) => (
    <View style={[styles.nutrientCard, { borderLeftColor: color }]}>
      <View style={styles.nutrientHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.nutrientTitle}>{title}</Text>
      </View>
      <Text style={styles.nutrientValue}>
        {value.toFixed(1)}
        <Text style={styles.nutrientUnit}> {unit}</Text>
      </Text>
    </View>
  );

  const renderFoodItem = (item: FoodAnalysisItem, index: number) => (
    <View key={index} style={styles.foodItem}>
      <View style={styles.foodItemHeader}>
        <View style={styles.foodItemInfo}>
          <Text style={styles.foodItemName}>{item.name}</Text>
          <Text style={styles.foodItemCategory}>{item.category}</Text>
        </View>
        <View style={styles.foodItemQuantity}>
          <Text style={styles.quantityText}>{item.quantity_g.toFixed(0)}g</Text>
        </View>
      </View>
      <View style={styles.foodItemNutrients}>
        <View style={styles.microNutrient}>
          <Text style={styles.microNutrientLabel}>Calories</Text>
          <Text style={styles.microNutrientValue}>{item.calories.toFixed(0)}</Text>
        </View>
        <View style={styles.microNutrient}>
          <Text style={styles.microNutrientLabel}>Protein</Text>
          <Text style={styles.microNutrientValue}>{item.protein_g.toFixed(1)}g</Text>
        </View>
        <View style={styles.microNutrient}>
          <Text style={styles.microNutrientLabel}>Carbs</Text>
          <Text style={styles.microNutrientValue}>{item.carbs_g.toFixed(1)}g</Text>
        </View>
        <View style={styles.microNutrient}>
          <Text style={styles.microNutrientLabel}>Fat</Text>
          <Text style={styles.microNutrientValue}>{item.fat_g.toFixed(1)}g</Text>
        </View>
      </View>
    </View>
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.accent;
    if (confidence >= 0.6) return '#FF9800';
    return colors.danger;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Results</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Confidence Badge */}
        <View style={styles.confidenceContainer}>
          <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(analysis.confidence) }]}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.confidenceText}>
              {getConfidenceText(analysis.confidence)} ({(analysis.confidence * 100).toFixed(0)}%)
            </Text>
          </View>
        </View>

        {/* Main Nutrients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Summary</Text>
          <View style={styles.nutrientsGrid}>
            {renderNutrientCard('Calories', analysis.total_calories, 'kcal', colors.accent, 'flame-outline')}
            {renderNutrientCard('Protein', analysis.total_protein_g, 'g', colors.accent, 'fitness-outline')}
            {renderNutrientCard('Carbs', analysis.total_carbs_g, 'g', colors.accent, 'water-outline')}
            {renderNutrientCard('Fat', analysis.total_fat_g, 'g', colors.accent, 'water-outline')}
          </View>
        </View>

        {/* Additional Nutrients */}
        {(analysis.total_fiber_g > 0 || analysis.total_sugar_g > 0 || analysis.total_sodium_mg > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Nutrients</Text>
            <View style={styles.additionalNutrients}>
              {analysis.total_fiber_g > 0 && (
                <View style={styles.additionalNutrient}>
                  <Ionicons name="leaf-outline" size={20} color={colors.accent} />
                  <Text style={styles.additionalNutrientLabel}>Fiber</Text>
                  <Text style={styles.additionalNutrientValue}>{analysis.total_fiber_g.toFixed(1)}g</Text>
                </View>
              )}
              {analysis.total_sugar_g > 0 && (
                <View style={styles.additionalNutrient}>
                  <Ionicons name="restaurant-outline" size={20} color={colors.accent} />
                  <Text style={styles.additionalNutrientLabel}>Sugar</Text>
                  <Text style={styles.additionalNutrientValue}>{analysis.total_sugar_g.toFixed(1)}g</Text>
                </View>
              )}
              {analysis.total_sodium_mg > 0 && (
                <View style={styles.additionalNutrient}>
                  <Ionicons name="water-outline" size={20} color={colors.accent} />
                  <Text style={styles.additionalNutrientLabel}>Sodium</Text>
                  <Text style={styles.additionalNutrientValue}>{analysis.total_sodium_mg.toFixed(0)}mg</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Food Items */}
        {analysis.foods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detected Food Items</Text>
            {analysis.foods.map((item, index) => renderFoodItem(item, index))}
          </View>
        )}

        {/* Scan Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Information</Text>
          <View style={styles.scanInfo}>
            <View style={styles.scanInfoItem}>
              <Ionicons name="time-outline" size={20} color={colors.muted} />
              <Text style={styles.scanInfoLabel}>Scan Time</Text>
              <Text style={styles.scanInfoValue}>
                {new Date(scan.scan_date).toLocaleString()}
              </Text>
            </View>
            {scan.meal_type && (
              <View style={styles.scanInfoItem}>
                <Ionicons name="restaurant-outline" size={20} color={colors.muted} />
                <Text style={styles.scanInfoLabel}>Meal Type</Text>
                <Text style={styles.scanInfoValue}>
                  {scan.meal_type.charAt(0).toUpperCase() + scan.meal_type.slice(1)}
                </Text>
              </View>
            )}
            {scan.notes && (
              <View style={styles.scanInfoItem}>
                <Ionicons name="text-outline" size={20} color={colors.muted} />
                <Text style={styles.scanInfoLabel}>Notes</Text>
                <Text style={styles.scanInfoValue}>{scan.notes}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSaveToDiary}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            )}
            <Text style={styles.primaryButtonText}>
              {isSaving ? 'Saving...' : 'Save to Diary'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Food' })}
            disabled={isSaving}
          >
            <Ionicons name="camera-outline" size={20} color={colors.accent} />
            <Text style={styles.secondaryButtonText}>Scan Another Food</Text>
          </TouchableOpacity>
        </View>

        {/* Health Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Health Tips</Text>
          <Text style={styles.tipText}>
            {analysis.total_protein_g < 20 ? 
              "Consider adding more protein-rich foods to support muscle growth and repair." :
              analysis.total_calories > 800 ?
              "This is a calorie-dense meal. Consider portion control if managing weight." :
              "Great balance! Continue monitoring your daily nutrition goals."
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  shareButton: {
    padding: 8,
  },
  confidenceContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutrientCard: {
    width: (width - 56) / 2,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutrientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientTitle: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: 8,
  },
  nutrientValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  nutrientUnit: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: 'normal',
  },
  additionalNutrients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  additionalNutrient: {
    width: (width - 56) / 3,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${colors.background}88`,
    borderRadius: 12,
    marginBottom: 12,
  },
  additionalNutrientLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  additionalNutrientValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  foodItem: {
    backgroundColor: `${colors.background}88`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  foodItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  foodItemCategory: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  foodItemQuantity: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  foodItemNutrients: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  microNutrient: {
    alignItems: 'center',
    flex: 1,
  },
  microNutrientLabel: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  microNutrientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  scanInfo: {
    backgroundColor: `${colors.background}88`,
    borderRadius: 12,
    padding: 16,
  },
  scanInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanInfoLabel: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: 12,
    flex: 1,
  },
  scanInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: `${colors.accent}22`,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
});