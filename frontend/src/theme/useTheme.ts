import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  
  return colorScheme === 'dark' ? darkColors : lightColors;
};
