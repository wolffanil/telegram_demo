import CustomText from "@/components/ui/CustomText";
import UserAvatar from "@/components/ui/UserAvatar";
import { logoutFromApp } from "@/services/api/authService";
import { useAuthStore } from "@/services/authStore";
import { profileStyles } from "@/styles/profileStyles";
import { searchStyles } from "@/styles/searchStyles";
import { registerForPushNotificationsAsync } from "@/utils/NotificationHandler";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  const { user } = useAuthStore();

  const logoutHandler = async () => {
    registerForPushNotificationsAsync()
      .then(async (token) => await logoutFromApp(token ?? ""))
      .catch((error: any) =>
        Alert.alert("You need to be connected to internet")
      );
  };

  return (
    <View style={searchStyles.container}>
      <View style={searchStyles.titleContainer}>
        <SafeAreaView />
        <View style={searchStyles.flexRowGap2}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back-outline"
              style={searchStyles.icon}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <CustomText variant="h4" style={searchStyles.name}>
            Profile
          </CustomText>
        </View>
      </View>

      <View style={profileStyles.center}>
        <UserAvatar user={user} size="large" />
        <CustomText variant="h4" style={profileStyles?.name}>
          {user?.full_name}
        </CustomText>
        <CustomText style={profileStyles?.username}>
          @{user?.username}
        </CustomText>
      </View>

      <TouchableOpacity style={profileStyles?.btn} onPress={logoutHandler}>
        <MaterialIcons name="logout" size={24} color="#fff" />
        <CustomText style={profileStyles?.text}>Logout</CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default Page;
