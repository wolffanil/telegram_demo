import NotificationItem from "@/components/search/NotificationItem";
import SearchBar from "@/components/search/SearchBar";
import CustomText from "@/components/ui/CustomText";
import { getAllConversations } from "@/services/api/chatService";
import {
  getAllFriendRequests,
  onHandleRequest,
} from "@/services/api/userService";
import { useUserStore } from "@/services/userStore";
import { searchStyles } from "@/styles/searchStyles";
import { useEffect, useState } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";

const Page = () => {
  const { requests } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const renderUsers = ({ item }: any) => {
    return (
      <NotificationItem
        onAcceptRequest={async () => {
          await onHandleRequest(item?._id, "ACCEPT");
          getAllFriendRequests();
          getAllConversations();
        }}
        onRejectRequest={async () => {
          await onHandleRequest(item?._id, "REJECT");
          getAllFriendRequests();
        }}
        item={item}
      />
    );
  };

  useEffect(() => {
    getAllFriendRequests();
  }, []);

  const refreshHandler = async () => {
    setIsRefreshing(true);
    await getAllFriendRequests();
    setIsRefreshing(false);
  };

  return (
    <View style={searchStyles.container}>
      <SearchBar
        title="Notifications"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <FlatList
        data={requests}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshHandler}
          />
        }
        ListEmptyComponent={<CustomText>No new requests!</CustomText>}
        renderItem={renderUsers}
        keyExtractor={(item: any) => item._id}
        initialNumToRender={5}
        contentContainerStyle={searchStyles.scrollContainer}
      />
    </View>
  );
};

export default Page;
