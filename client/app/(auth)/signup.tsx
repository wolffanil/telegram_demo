import CustomSafeAreaView from "@/components/ui/CustomSafeAreaView";
import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { launchGallery } from "@/utils/LibraryHelpers";
import { signupStyles } from "@/styles/signupStyles";
import CustomText from "@/components/ui/CustomText";
import { uploadFile } from "@/services/api/fileService";
import { checkUsername, signUpWithGoogle } from "@/services/api/authService";
import CustomInput from "@/components/ui/CustomInput";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [profilePic, setProfilePic] = useState<any>("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImagePick = async () => {
    const res = await launchGallery();

    if (res) {
      setProfilePic(res);
    }
  };

  const validateUsername = async (name: string) => {
    if (name.length > 4) {
      const isValid = await checkUsername(name);
      return isValid;
    }

    return false;
  };

  const createAccount = async () => {
    if (!userName || !firstName || !lastName || !profilePic) {
      Alert.alert("Error", "Please fill all details");
      return;
    }

    setLoading(true);

    try {
      const mediaUrl = await uploadFile(profilePic);

      await signUpWithGoogle({
        username: userName,
        first_name: firstName,
        last_name: lastName,
        profile_picture: mediaUrl,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomSafeAreaView>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back-outline" size={RFValue(20)} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleImagePick}
        style={signupStyles.cameraIcon}
      >
        {profilePic?.uri ? (
          <Image source={{ uri: profilePic?.uri }} style={signupStyles.image} />
        ) : (
          <MaterialCommunityIcons
            name="camera-plus"
            size={RFValue(18)}
            color="#fff"
          />
        )}
      </TouchableOpacity>

      <CustomText variant="h4" style={signupStyles.profileText}>
        Profile info
      </CustomText>
      <CustomText style={signupStyles.instructions}>
        Enter your unique username, name, and add profile photo
      </CustomText>

      <CustomInput
        label="Username"
        value={userName}
        onChangeText={setUserName}
        showValidationIcon
        validationFunction={validateUsername}
      />

      <CustomInput
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <CustomInput
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <View style={signupStyles.footer}>
        <CustomText style={signupStyles.termsText}>
          By signing up, you agree to the Terms & Services
        </CustomText>
        <TouchableOpacity
          style={signupStyles.submitButton}
          onPress={createAccount}
        >
          {!loading ? (
            <MaterialCommunityIcons
              name="arrow-right"
              size={RFValue(24)}
              color="#fff"
            />
          ) : (
            <ActivityIndicator color="#fff" size="small" />
          )}
        </TouchableOpacity>
      </View>
    </CustomSafeAreaView>
  );
};

export default SignUp;
