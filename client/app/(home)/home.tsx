import ChatList from "@/components/home/ChatList";
import HomeHeader from "@/components/home/HomeHeader";
import { homeStyles } from "@/styles/homeStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const Page = () => {
  return (
    <View style={homeStyles.container}>
      <HomeHeader />

      <ChatList />

      <TouchableOpacity
        onPress={() => router.navigate("/(home)/contacts")}
        style={homeStyles.absoluteButton}
      >
        <Ionicons name="chatbubble-sharp" size={RFValue(20)} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Page;
