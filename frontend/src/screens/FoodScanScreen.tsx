import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiService, FoodScanResponse } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { id: 'lunch', label: 'Lunch', icon: 'partly-sunny-outline' },
  { id: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { id: 'snack', label: 'Snack', icon: 'nutrition-outline' },
];

export default function FoodScanScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);

  const handleScanFood = async () => {
    try {
      setLoading(true);
      
      const result: FoodScanResponse = await apiService.captureAndScanFood(
        selectedMealType || undefined,
        notes || undefined
      );

      // Navigate to results screen
      navigation.navigate('FoodResult', { scanResult: result });
      
    } catch (error: any) {
      Alert.alert(
        'Scan Failed',
        error.message || 'Failed to scan food. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      setLoading(true);
      
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant gallery permissions to select an image.');
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedAsset = result.assets[0];
      
      // Create a FormData object to upload the image
      const formData = new FormData();
      formData.append('file', {
        uri: selectedAsset.uri,
        type: 'image/jpeg',
        name: 'food-image.jpg',
      } as any);

      // Upload and scan the food image
      const scanResult: FoodScanResponse = await apiService.scanFoodFromGallery(
        formData,
        selectedMealType || undefined,
        notes || undefined
      );

      // Navigate to results screen
      navigation.navigate('FoodResult', { scanResult });
      
    } catch (error: any) {
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload and scan image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderMealTypeModal = () => (
    <Modal
      visible={showMealTypeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMealTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Meal Type</Text>
          <View style={styles.mealTypesContainer}>
            {MEAL_TYPES.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === meal.id && styles.selectedMealType
                ]}
                onPress={() => {
                  setSelectedMealType(meal.id);
                  setShowMealTypeModal(false);
                }}
              >
                <Ionicons 
                  name={meal.icon as any} 
                  size={24} 
                  color={selectedMealType === meal.id ? '#fff' : colors.accent} 
                />
                <Text style={[
                  styles.mealTypeText,
                  selectedMealType === meal.id && styles.selectedMealTypeText
                ]}>
                  {meal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowMealTypeModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Food Scanner</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructions}>
            <Ionicons name="camera-outline" size={48} color={colors.accent} />
            <Text style={styles.instructionsTitle}>
              Scan Your Food
            </Text>
            <Text style={styles.instructionsText}>
              Take a photo of your meal to get detailed nutritional information including calories, protein, carbs, and more.
            </Text>
          </View>

          {/* Meal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Type (Optional)</Text>
            <TouchableOpacity
              style={styles.mealTypeSelector}
              onPress={() => setShowMealTypeModal(true)}
            >
              <Ionicons 
                name={selectedMealType ? 
                  MEAL_TYPES.find(m => m.id === selectedMealType)?.icon as any : 
                  'restaurant-outline'
                } 
                size={20} 
                color={colors.muted} 
              />
              <Text style={styles.mealTypeSelectorText}>
                {selectedMealType ? 
                  MEAL_TYPES.find(m => m.id === selectedMealType)?.label : 
                  'Select meal type'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Notes Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add any notes about this meal..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleScanFood}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="camera" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Take Photo & Scan</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleChooseFromGallery}
              disabled={loading}
            >
              <Ionicons name="images" size={20} color={colors.accent} />
              <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Tips for Best Results:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text style={styles.tipText}>Ensure good lighting</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text style={styles.tipText}>Capture the entire meal</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text style={styles.tipText}>Avoid shadows and glare</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
              <Text style={styles.tipText}>Use overhead view when possible</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Meal Type Modal */}
      {renderMealTypeModal()}
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
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  instructions: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    backgroundColor: `${colors.accent}22`,
    borderRadius: 16,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  mealTypeSelectorText: {
    fontSize: 16,
    color: colors.primary,
    flex: 1,
    marginLeft: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    minHeight: 80,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    backgroundColor: `${colors.background}88`,
    padding: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  mealTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mealTypeButton: {
    width: (width - 64) / 2,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  selectedMealType: {
    backgroundColor: colors.accent,
  },
  mealTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedMealTypeText: {
    color: '#fff',
  },
  modalCancelButton: {
    padding: 16,
    backgroundColor: `${colors.background}66`,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted,
  },
});