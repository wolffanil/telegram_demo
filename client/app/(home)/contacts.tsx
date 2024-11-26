import UserItem from "@/components/search/UserItem";
import CustomText from "@/components/ui/CustomText";
import { getAllConversations } from "@/services/api/chatService";
import { connectedFriends, unfriend } from "@/services/api/userService";
import { friendStyles } from "@/styles/friendStyles";
import { searchStyles } from "@/styles/searchStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import AlphabetList from "@raiden16f7/react-native-alphabet-list";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { RFValue } from "react-native-responsive-fontsize";
import { Colors } from "@/utils/Constants";

const Page = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userData, setUserData] = useState<any[] | undefined>([]);

  const renderItem = ({ item }: any) => {
    return (
      <UserItem
        item={item}
        onUnfriend={async () => {
          await unfriend(item?.id);
          fetchConnections();
          await getAllConversations();
        }}
      />
    );
  };

  const fetchConnections = async () => {
    const data = await connectedFriends();

    const updatedUserData = data?.map((user: any) => ({
      ...user,
      key: user?.full_name?.charAt(0).toLowerCase() as CharType,
      is_connected: true,
    }));
    setUserData(updatedUserData);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const refreshHandler = async () => {
    setIsRefreshing(true);
    await fetchConnections();
    setIsRefreshing(false);
  };

  return (
    <View style={friendStyles.container}>
      <View style={searchStyles.titleContainer}>
        <SafeAreaView />
        <View style={searchStyles.flexRowGap2}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back-outline"
              style={searchStyles?.icon}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <CustomText variant="h4" style={searchStyles.name}>
            Contacts
          </CustomText>
        </View>
      </View>

      {userData && userData?.length > 0 ? (
        <AlphabetList
          data={userData}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshHandler}
            />
          }
          renderItem={renderItem}
          lineWidth={0}
          headerTitleStyle={{ fontSize: RFValue(12) }}
          trackSize={0}
          trackScale={1.2}
          contentContainerStyle={{ padding: 5 }}
          textColorActive={Colors.primary}
        />
      ) : (
        <CustomText
          variant="h5"
          style={[
            searchStyles?.name,
            {
              margin: 10,
            },
          ]}
        >
          No data...
        </CustomText>
      )}
    </View>
  );
};

export default gestureHandlerRootHOC(Page);
