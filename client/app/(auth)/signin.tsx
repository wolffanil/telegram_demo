import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import CustomText from "@/components/ui/CustomText";
import { signInWithGoogle } from "@/services/api/authService";
import { siginStyles } from "@/styles/signinStyles";
import LottieView from "lottie-react-native";
import { Image, TouchableOpacity } from "react-native";

const singin = () => {
  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <CustomSafeAreaView>
      <LottieView
        autoPlay
        loop
        style={siginStyles.animation}
        source={require("@/assets/animations/telegram.json")}
      />

      <CustomText variant="h3" style={siginStyles.title}>
        Welcome to Telegram
      </CustomText>
      <CustomText style={siginStyles.message}>
        Messages are heavily encrypted and can self-destruct
      </CustomText>

      <TouchableOpacity style={siginStyles.loginBtn} onPress={handleSignIn}>
        <Image
          source={require("@/assets/icons/google.png")}
          style={siginStyles.googleIcon}
        />
        <CustomText>Sign in with Google</CustomText>
      </TouchableOpacity>
    </CustomSafeAreaView>
  );
};

export default singin;
