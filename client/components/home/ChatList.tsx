import { FlatList, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import EmptyComponent from "./EmptyComponent";
import ChatItem from "./ChatItem";
import { useChatStore } from "@/services/chatStore";
import { getAllConversations } from "@/services/api/chatService";
import { useConversationsSubscription } from "@/services/sockets/useConversationsSubscriptions";

const ChatList = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useConversationsSubscription();

  const { conversations } = useChatStore();

  const renderChats = ({ item }: any) => {
    return <ChatItem item={item} />;
  };

  const refreshHandler = async () => {
    setIsRefreshing(true);
    await getAllConversations();
    setIsRefreshing(false);
  };

  useEffect(() => {
    getAllConversations();
  }, []);

  return (
    <FlatList
      refreshControl={
        <RefreshControl onRefresh={refreshHandler} refreshing={isRefreshing} />
      }
      data={conversations?.filter((item) => item?.messages?.length > 0)}
      renderItem={renderChats}
      keyExtractor={(item: any) => item.conversationId}
      ListEmptyComponent={<EmptyComponent />}
    />
  );
};

export default ChatList;
