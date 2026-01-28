import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "device_id";

export async function getDeviceId() {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error("Error getting device ID:", error);
    return crypto.randomUUID();
  }
}
