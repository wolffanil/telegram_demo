import { refresh_token } from "@/services/api/apiInterceptors";
import { tokenStorage } from "@/services/storage";
import { splashStyles } from "@/styles/splashStyles";
import { resetAndNavigate } from "@/utils/LibraryHelpers";
import { useEffect } from "react";
import { View, Text, Image, LogBox, Alert } from "react-native";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
}

LogBox.ignoreAllLogs();

const Home = () => {
  const tokenCheck = async () => {
    const accessToken = tokenStorage.getString("accessToken") as string;
    const refreshToken = tokenStorage.getString("refreshToken") as string;

    if (accessToken) {
      const decodedAccessToken = jwtDecode<DecodedToken>(refreshToken);
      const decodedRefreshToken = jwtDecode<DecodedToken>(refreshToken);
      const currentTime = Date.now() / 1000;

      if (decodedRefreshToken?.exp < currentTime) {
        resetAndNavigate("/(auth)/signin");
        Alert.alert("Session Expired, please login again");
        return false;
      }

      if (decodedAccessToken?.exp < currentTime) {
        try {
          refresh_token();
        } catch (error) {
          Alert.alert("There was an error");
          return false;
        }
      }

      resetAndNavigate("/(home)/home");
      return true;
    }

    resetAndNavigate("/(auth)/signin");
    return false;
  };

  useEffect(() => {
    const timeoutId = setTimeout(tokenCheck, 1000);
    return () => clearTimeout(timeoutId);

    // setTimeout(() => {
    //   resetAndNavigate("/(auth)/signin");
    // }, 300);
  }, []);

  return (
    <View style={splashStyles.container}>
      <Image
        source={require("@/assets/images/adaptive-icon.png")}
        style={splashStyles.logo}
      />
    </View>
  );
};

export default Home;
