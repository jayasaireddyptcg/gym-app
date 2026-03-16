import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
} from "react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { apiService, EquipmentScanResult } from "../services/api";

type NavItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
};

const { width } = Dimensions.get("window");

export default function EquipmentScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>("back");
  const [scanResult, setScanResult] = useState<EquipmentScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    if (isFocused && !permission?.granted) {
      requestPermission();
    }
  }, [isFocused, permission?.granted, requestPermission]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    const canAskAgain = permission.canAskAgain ?? true;
    const permissionMessage = canAskAgain
      ? "Camera access is required to scan equipment."
      : "Camera access has been denied. Enable it in Settings to scan equipment.";
    const permissionActionLabel = canAskAgain ? "Enable Camera" : "Open Settings";
    const handlePermissionPress = () => {
      if (canAskAgain) {
        requestPermission();
      } else {
        Linking.openSettings();
      }
    };

    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{permissionMessage}</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={handlePermissionPress}
        >
          <Text style={styles.permissionButtonText}>{permissionActionLabel}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cameraActive = isFocused && permission.granted;
  const controlsDisabled = !cameraActive || isScanning;

  const formatEquipmentKey = (key: string) =>
    key
      .replace(/-/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());

  const uploadAndScan = async (uri: string) => {
    setIsScanning(true);
    setScanResult(null);
    setScanError(null);

    try {
      const { upload_url, file_key } = await apiService.getEquipmentUploadUrl();
      const fileResponse = await fetch(uri);
      const blob = await fileResponse.blob();

      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const scanResponse = await apiService.scanEquipment(file_key);
      setScanResult(scanResponse.equipment);
      await SecureStore.setItemAsync(
        "last_scanned_equipment",
        scanResponse.equipment.equipment_key
      ).catch(() => undefined);
      (navigation as any).navigate("EquipmentResult", {
        equipment: scanResponse.equipment.equipment_key,
        confidence: scanResponse.equipment.confidence,
        imageKey: file_key,
      });
    } catch (error: any) {
      setScanError(error?.message ?? "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCapture = async () => {
    if (isScanning) {
      return;
    }

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
      });

      if (!photo?.uri) {
        throw new Error("Camera not ready");
      }

      await uploadAndScan(photo.uri);
    } catch (error: any) {
      setScanError(error?.message ?? "Camera not ready");
    }
  };

  const handlePickImage = async () => {
    if (isScanning) {
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setScanError("Gallery permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await uploadAndScan(result.assets[0].uri);
    }
  };

  const handleToggleCamera = () => {
    setCameraFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleToggleFlash = () => {
    setTorchOn((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {cameraActive ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraFacing}
          enableTorch={cameraFacing === "back" && torchOn}
          pointerEvents="none"
        />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}

      {/* Dark overlay */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* UI Layer */}
      <SafeAreaView style={styles.ui} pointerEvents="box-none">
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.iconSpacer} />

          <View style={styles.titlePill}>
            <Text style={styles.title}>Equipment Scan</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.iconButton,
              torchOn && styles.iconButtonActive,
              !cameraActive && styles.controlDisabled,
            ]}
            onPress={handleToggleFlash}
            disabled={!cameraActive}
          >
            <MaterialIcons
              name={torchOn ? "flash-on" : "flash-off"}
              size={20}
              color={torchOn ? "#000" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Center Scan Area */}
        <View style={styles.center}>
          <View style={styles.instruction}>
            <Text style={styles.instructionText}>
              Align equipment within the frame
            </Text>
          </View>

          {/* Scan Frame */}
          <View style={styles.frame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <View style={styles.scanLine} />
          </View>

          {/* Detecting */}
          <View style={styles.detecting}>
            {isScanning ? (
              <ActivityIndicator size={12} color="#000" />
            ) : (
              <MaterialIcons
                name={scanError ? "error" : "check-circle"}
                size={14}
                color="#000"
              />
            )}
            <Text style={styles.detectingText}>
              {isScanning
                ? "Detecting..."
                : scanResult
                  ? `Detected: ${formatEquipmentKey(scanResult.equipment_key)}`
                  : scanError
                    ? "Scan failed"
                    : "Ready to scan"}
            </Text>
          </View>
          {scanError ? (
            <Text style={styles.errorText}>{scanError}</Text>
          ) : null}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.sideButton, controlsDisabled && styles.controlDisabled]}
            onPress={handlePickImage}
            disabled={controlsDisabled}
          >
            <MaterialIcons name="image" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.capture, controlsDisabled && styles.controlDisabled]}
            onPress={handleCapture}
            disabled={controlsDisabled}
          >
            <View style={styles.captureOuter} />
            <View style={styles.captureInner}>
              <MaterialIcons name="photo-camera" size={32} color="#000" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideButton, controlsDisabled && styles.controlDisabled]}
            onPress={handleToggleCamera}
            disabled={controlsDisabled}
          >
            <MaterialIcons name="flip-camera-ios" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 0,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  permissionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  permissionButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  permissionButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  controlDisabled: {
    opacity: 0.5,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 1,
  },
  ui: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 2,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  iconSpacer: {
    width: 44,
    height: 44,
  },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonActive: {
    backgroundColor: colors.accent,
  },
  titlePill: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  center: {
    alignItems: "center",
  },
  instruction: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    marginBottom: spacing.lg,
  },
  instructionText: {
    color: "#fff",
    fontSize: 13,
  },
  frame: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: colors.accent,
  },
  tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 },
  scanLine: {
    position: "absolute",
    top: "50%",
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: `${colors.accent}aa`,
    shadowColor: colors.accent,
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  detecting: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
  },
  detectingText: {
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 6,
    letterSpacing: 1,
    color: "#000",
  },
  errorText: {
    marginTop: spacing.sm,
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    marginHorizontal: spacing.lg,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  capture: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  captureOuter: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
