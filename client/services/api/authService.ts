import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "axios";
import { BASE_URL } from "../config";
import { tokenStorage } from "../storage";
import { useAuthStore } from "../authStore";
import { resetAndNavigate } from "@/utils/LibraryHelpers";
import { appAxios } from "./apiInterceptors";
import { useChatStore } from "../chatStore";
import { useUserStore } from "../userStore";

GoogleSignin.configure({
  webClientId: "",
  forceCodeForRefreshToken: true,
  offlineAccess: false,
  iosClientId: "",
});

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut();

    const res = await GoogleSignin.signIn();

    const apiRes = await axios.post(`${BASE_URL}/oauth/login`, {
      id_token: res?.data?.idToken,
    });

    const { tokens, user } = apiRes.data;

    tokenStorage.set("accessToken", tokens?.access_token);
    tokenStorage.set("refreshToken", tokens?.refresh_token);

    const { setUser } = useAuthStore.getState();
    setUser(user);
    resetAndNavigate("");
  } catch (error: any) {
    if (error.response.status === 400) {
      resetAndNavigate("/(auth)/singup");
    }
  }
};

export const signUpWithGoogle = async (data: any) => {
  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.signOut();

    const res = await GoogleSignin.signIn();

    const apiRes = await axios.post(`${BASE_URL}/oauth/login`, {
      id_token: res?.data?.idToken,
      ...data,
    });

    const { tokens, user } = apiRes.data;

    tokenStorage.set("accessToken", tokens?.access_token);
    tokenStorage.set("refreshToken", tokens?.refresh_token);

    const { setUser } = useAuthStore.getState();
    setUser(user);
    resetAndNavigate("");
  } catch (error: any) {
    return null;
  }
};

export const checkUsername = async (username: string) => {
  try {
    const apiRes = await axios.post(`${BASE_URL}/oauth/check-username`, {
      username,
    });
  } catch (error) {
    return false;
  }
};

export const registerDeviceToken = async (device_token: string) => {
  const { deviceTokenAdded, setDeviceTokenStatus } = useAuthStore.getState();

  if (deviceTokenAdded) {
    return;
  }

  try {
    const apiRes = await appAxios.post("/device-token/register", {
      device_token,
    });
    setDeviceTokenStatus(true);
  } catch (error) {
    setDeviceTokenStatus(false);
    console.log("Device token", error);
  }
};

export const logoutFromApp = async (device_token: string) => {
  try {
    const apiRes = await appAxios.post("/device-token/remove", {
      device_token,
    });
    const { logout } = useAuthStore.getState();
    const { clearAllChats } = useChatStore.getState();
    const { clearUserStore } = useUserStore.getState();
    logout();
    clearAllChats();
    clearUserStore();
    tokenStorage.clearAll();
    resetAndNavigate("/(auth)/signin");
  } catch (error) {
    console.log(error);
  }
};
