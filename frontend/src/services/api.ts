import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";
import * as ImagePicker from 'expo-image-picker';

export const API_URL = "https://exp://172.20.10.2:8081/";

export const api = axios.create({
  baseURL: __DEV__ 
    ? 'https://exp://172.20.10.2:8081/'
    : API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateProfileRequest extends UserProfile {}

export interface ScanResponse {
  equipment_key: string;
  confidence: number;
}

export interface PresignedUploadResponse {
  upload_url: string;
  file_key: string;
}

export interface EquipmentScanResult {
  equipment_key: string;
  confidence: number;
}

export interface ScanEquipmentResponse {
  equipment: EquipmentScanResult;
}

// Food scanning interfaces
export interface FoodAnalysisItem {
  name: string;
  category: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
}

export interface FoodAnalysisResult {
  foods: FoodAnalysisItem[];
  confidence: number;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
  total_sodium_mg: number;
  error?: string;
}

export interface FoodScan {
  id: number;
  image_url: string;
  scan_date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
  total_sodium_mg: number;
  meal_type?: string;
  confidence_score: number;
  notes?: string;
}

export interface FoodScanResponse {
  scan: FoodScan;
  analysis: FoodAnalysisResult;
  message: string;
}

export interface NutritionGoal {
  id: number;
  date: string;
  calories_goal: number;
  protein_goal_g: number;
  carbs_goal_g: number;
  fat_goal_g: number;
  fiber_goal_g: number;
  sodium_limit_mg: number;
}

export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  total_sugar_g: number;
  total_sodium_mg: number;
  meals_count: number;
  goals?: NutritionGoal;
  goal_progress?: {
    calories_percent: number;
    protein_percent: number;
    carbs_percent: number;
    fat_percent: number;
    fiber_percent: number;
    sodium_percent: number;
  };
}

// Step tracking interfaces
export interface StepData {
  steps: number;
  distance: number;
  calories: number;
  flights: number;
  date: string;
}

export interface DailyStepSummary {
  date: string;
  total_steps: number;
  total_distance: number;
  total_calories: number;
  total_flights: number;
  step_goal: number;
  goal_progress: number;
  is_goal_achieved: boolean;
}

export interface StepGoal {
  id: number;
  date: string;
  step_goal: number;
}

export interface WeeklyStepStats {
  weekly_data: Array<{
    date: string;
    steps: number;
    distance: number;
    calories: number;
    flights: number;
    goal_achieved: boolean;
  }>;
  total_weekly_steps: number;
  avg_daily_steps: number;
  total_distance: number;
  total_calories: number;
  goals_achieved: number;
}

class ApiService {
private async setupAuthHeader(): Promise<void> {
  const token = await tokenStorage.getToken();

  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}


  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', data);
      const result = response.data;
      await tokenStorage.setToken(result.access_token);
      await this.setupAuthHeader();
      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/signup', data);
      const result = response.data;
      await tokenStorage.setToken(result.access_token);
      await this.setupAuthHeader();
      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Signup failed');
    }
  }

  async getProfile(): Promise<UserProfile> {
    await this.setupAuthHeader();
    const response = await api.get('/users/me');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    await this.setupAuthHeader();
    try {
      await api.put('/users/me', data);
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('This email is already linked to another account');
      }
      throw new Error(error.response?.data?.detail || 'Failed to update profile');
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.setupAuthHeader();
    await api.post('/users/change-password', data);
  }

  async logout(): Promise<void> {
    await tokenStorage.removeToken();
    await this.setupAuthHeader();
  }

  async getToken(): Promise<string | null> {
    return await tokenStorage.getToken();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

 async initializeAuth(): Promise<boolean> {
  const token = await this.getToken();

  if (!token) {
    return false;
  }

  await this.setupAuthHeader();

  try {
    // optional but recommended: validate token
    await api.get("/users/me");
    return true;
  } catch {
    await this.logout();
    return false;
  }
}


  // Equipment scanning methods
  async getEquipmentUploadUrl(): Promise<PresignedUploadResponse> {
    await this.setupAuthHeader();
    const response = await api.post('/uploads/presign');
    return response.data;
  }

  async uploadImageToS3(presignedData: PresignedUploadResponse, imageUri: string): Promise<void> {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    await fetch(presignedData.upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: blob,
    });
  }

  async scanEquipment(imageKey: string): Promise<ScanEquipmentResponse> {
    await this.setupAuthHeader();
    const response = await api.post('/equipment', { image_key: imageKey });
    return response.data;
  }

  async captureAndScanEquipment(): Promise<ScanEquipmentResponse> {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      throw new Error('Camera permission required');
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      throw new Error('Camera capture cancelled');
    }

    // Get presigned URL
    const presignedData = await this.getEquipmentUploadUrl();
    
    // Upload to S3
    await this.uploadImageToS3(presignedData, result.assets[0].uri);
    
    // Scan equipment
    return await this.scanEquipment(presignedData.file_key);
  }

  // Food scanning methods
  async getFoodUploadUrl(): Promise<PresignedUploadResponse> {
    await this.setupAuthHeader();
    const response = await api.post('/uploads/presign');
    return response.data;
  }

  async scanFood(imageKey: string, mealType?: string, notes?: string): Promise<FoodScanResponse> {
    await this.setupAuthHeader();
    const response = await api.post('/food/scan', {
      image_key: imageKey,
      meal_type: mealType,
      notes: notes
    });
    return response.data;
  }

  async captureAndScanFood(mealType?: string, notes?: string): Promise<FoodScanResponse> {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      throw new Error('Camera permission required');
    }

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      throw new Error('Camera capture cancelled');
    }

    // Get presigned URL
    const presignedData = await this.getFoodUploadUrl();
    
    // Upload to S3
    await this.uploadImageToS3(presignedData, result.assets[0].uri);
    
    // Scan food
    return await this.scanFood(presignedData.file_key, mealType, notes);
  }

  async scanFoodFromGallery(formData: FormData, mealType?: string, notes?: string): Promise<FoodScanResponse> {
    await this.setupAuthHeader();
    
    // Upload image directly to backend for processing
    const response = await api.post('/food/scan-from-gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async getFoodScans(limit: number = 50, offset: number = 0): Promise<FoodScan[]> {
    await this.setupAuthHeader();
    const response = await api.get(`/food/scans?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async getFoodScanById(scanId: number): Promise<FoodScan> {
    await this.setupAuthHeader();
    const response = await api.get(`/food/scans/${scanId}`);
    return response.data;
  }

  async deleteFoodScan(scanId: number): Promise<void> {
    await this.setupAuthHeader();
    await api.delete(`/food/scans/${scanId}`);
  }

  async getTodayNutritionSummary(): Promise<DailyNutritionSummary> {
    await this.setupAuthHeader();
    const response = await api.get('/food/today-summary');
    return response.data;
  }

  async getDailyNutritionSummary(date: string): Promise<DailyNutritionSummary> {
    await this.setupAuthHeader();
    const response = await api.get(`/food/daily-summary/${date}`);
    return response.data;
  }

  async setNutritionGoals(goals: {
    date: string;
    calories_goal?: number;
    protein_goal_g?: number;
    carbs_goal_g?: number;
    fat_goal_g?: number;
    fiber_goal_g?: number;
    sodium_limit_mg?: number;
  }): Promise<NutritionGoal> {
    await this.setupAuthHeader();
    const response = await api.post('/food/goals', goals);
    return response.data;
  }

  async getNutritionGoals(date: string): Promise<NutritionGoal> {
    await this.setupAuthHeader();
    const response = await api.get(`/food/goals/${date}`);
    return response.data;
  }

  async getWeeklyNutritionStats(): Promise<{
    weekly_data: Array<{
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      meals: number;
    }>;
    total_weekly_calories: number;
    avg_daily_calories: number;
    total_meals: number;
  }> {
    await this.setupAuthHeader();
    const response = await api.get('/food/stats/weekly');
    return response.data;
  }

  // Password Reset Methods
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  }

  // Step tracking methods
  async saveStepData(stepData: StepData): Promise<DailyStepSummary> {
    await this.setupAuthHeader();
    const response = await api.post('/steps', stepData);
    return response.data;
  }

  async getTodayStepSummary(): Promise<DailyStepSummary> {
    await this.setupAuthHeader();
    const response = await api.get('/steps/today');
    return response.data;
  }

  async getDailyStepSummary(date: string): Promise<DailyStepSummary> {
    await this.setupAuthHeader();
    const response = await api.get(`/steps/daily/${date}`);
    return response.data;
  }

  async getWeeklyStepStats(): Promise<WeeklyStepStats> {
    await this.setupAuthHeader();
    const response = await api.get('/steps/stats/weekly');
    return response.data;
  }

  async setStepGoal(stepGoal: { date: string; step_goal: number }): Promise<StepGoal> {
    await this.setupAuthHeader();
    const response = await api.post('/steps/goals', stepGoal);
    return response.data;
  }

  async getStepGoal(date: string): Promise<StepGoal> {
    await this.setupAuthHeader();
    const response = await api.get(`/steps/goals/${date}`);
    return response.data;
  }

  async getStepHistory(limit: number = 30, offset: number = 0): Promise<DailyStepSummary[]> {
    await this.setupAuthHeader();
    const response = await api.get(`/steps/history?limit=${limit}&offset=${offset}`);
    return response.data;
  }
}

export const apiService = new ApiService();
