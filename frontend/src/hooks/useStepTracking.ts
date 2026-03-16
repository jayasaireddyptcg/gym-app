import { useState, useEffect, useCallback } from 'react';
import { apiService, StepData, DailyStepSummary } from '../services/api';

export const useStepTracking = () => {
  const [stepData, setStepData] = useState({
    steps: 0,
    distance: 0,
    calories: 0,
    flights: 0,
    goal: 10000
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastSavedSteps, setLastSavedSteps] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Load today's step data from API
  const loadTodayStepData = useCallback(async () => {
    try {
      setIsLoading(true);
      const summary = await apiService.getTodayStepSummary();
      
      setStepData({
        steps: summary.total_steps,
        distance: summary.total_distance,
        calories: summary.total_calories,
        flights: summary.total_flights,
        goal: summary.step_goal
      });
      setLastSavedSteps(summary.total_steps);
    } catch (error) {
      console.log('No existing step data found, starting fresh');
      // If no data exists, try to get step goal
      try {
        const today = new Date().toISOString().split('T')[0];
        const goalData = await apiService.getStepGoal(today);
        setStepData(prev => ({ ...prev, goal: goalData.step_goal }));
      } catch (goalError) {
        console.log('No goal set, using default');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save step data to API
  const saveStepData = useCallback(async (steps: number) => {
    if (isSaving || steps === lastSavedSteps) return;

    try {
      setIsSaving(true);
      const today = new Date().toISOString().split('T')[0];
      
      const stepDataToSave: StepData = {
        steps,
        distance: parseFloat((steps * 0.000762).toFixed(1)), // Average stride length
        calories: Math.round(steps * 0.04), // Rough estimate
        flights: Math.floor(steps / 20), // Rough estimate
        date: today
      };

      const summary = await apiService.saveStepData(stepDataToSave);
      
      setStepData({
        steps: summary.total_steps,
        distance: summary.total_distance,
        calories: summary.total_calories,
        flights: summary.total_flights,
        goal: summary.step_goal
      });
      setLastSavedSteps(summary.total_steps);
      
      console.log('Step data saved successfully');
    } catch (error) {
      console.error('Failed to save step data:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, lastSavedSteps]);

  // Update step data locally (for real-time UI updates)
  const updateStepData = useCallback((steps: number) => {
    const distance = parseFloat((steps * 0.000762).toFixed(1));
    const calories = Math.round(steps * 0.04);
    const flights = Math.floor(steps / 20);
    
    setStepData(prev => ({
      ...prev,
      steps,
      distance,
      calories,
      flights
    }));
  }, []);

  // Auto-save step data periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (stepData.steps > lastSavedSteps && !isSaving) {
        saveStepData(stepData.steps);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [stepData.steps, lastSavedSteps, isSaving, saveStepData]);

  // Load today's data on mount
  useEffect(() => {
    loadTodayStepData();
  }, [loadTodayStepData]);

  return {
    stepData,
    isLoading,
    isSaving,
    updateStepData,
    saveStepData,
    loadTodayStepData
  };
};
