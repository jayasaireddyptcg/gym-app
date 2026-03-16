import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

interface StepCounterProps {
  onStepUpdate?: (steps: number) => void;
}

export default function StepCounter({ onStepUpdate }: StepCounterProps) {
  // 1. Define types for your state
  const [currentStepCount, setCurrentStepCount] = useState<number>(0);
  const [subscription, setSubscription] = useState<Pedometer.Subscription | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Pedometer.PermissionStatus | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const subscribe = async () => {
    setIsLoading(true);
    
    try {
      // 2. Check availability
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (available) {
        // 3. Request Permissions
        const perm = await Pedometer.requestPermissionsAsync();
        setPermissionStatus(perm.status);

        if (perm.granted) {
          // 4. (iOS Only) Get steps from midnight until now
          if (Platform.OS === 'ios') {
            const end = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0); // Midnight today

            try {
              const pastSteps = await Pedometer.getStepCountAsync(start, end);
              setCurrentStepCount(pastSteps.steps);
              onStepUpdate?.(pastSteps.steps);
            } catch (error) {
              console.log("Error fetching past steps:", error);
            }
          }

          // 5. Start Live Tracking
          const sub = Pedometer.watchStepCount((result: Pedometer.PedometerResult) => {
            let newSteps: number;
            if (Platform.OS === 'ios') {
              // On iOS, watchStepCount provides the steps taken since the *listener* started.
              // We manually increment our count to combine it with the historical fetch.
              setCurrentStepCount((prev) => {
                newSteps = prev + 1;
                onStepUpdate?.(newSteps);
                return newSteps;
              });
            } else {
              // On Android, result.steps is the count for the current session
              setCurrentStepCount((prev) => {
                newSteps = result.steps;
                onStepUpdate?.(newSteps);
                return newSteps;
              });
            }
          });

          setSubscription(sub);
        }
      }
    } catch (error) {
      console.log("Error initializing pedometer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    subscribe();
    // Cleanup
    return () => {
      subscription && subscription.remove();
      setSubscription(null);
    };
  }, []);

  // This component is now a pure data provider - no UI rendering
  // All step data is handled through the onStepUpdate callback
  return null;
}

// No styles needed - this is now a pure data provider component
