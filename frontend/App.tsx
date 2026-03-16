import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { apiService } from "./src/services/api";

function AppContent() {
  const { setAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      const isValid = await apiService.initializeAuth();
      setAuthenticated(isValid);
      setIsReady(true);
    };

    init();
  }, []);

  if (!isReady) return null;

  return <RootNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
