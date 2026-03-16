export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  MainTabs: undefined;
  EquipmentScan: undefined;
  EquipmentResult: {
    equipment: string;
    confidence: number;
    imageKey: string;
  };
  FoodScan: undefined;
  FoodResult: {
    scanResult: {
      scan: any;
      analysis: any;
      message: string;
    };
  };
  ExerciseList: undefined;
  ExerciseDetail: {
    exercise: string;
    muscle: string;
    level: string;
    equipment: string;
  };
  EditProfile: undefined;
  ChangePassword: undefined;
  StepCounter: undefined;
};
