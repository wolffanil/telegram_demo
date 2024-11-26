import Chat from "@/components/chat/Chat";
import ChatHeader from "@/components/chat/ChatHeader";
import SendButton from "@/components/chat/SendButton";
import { usePaginatedChats } from "@/services/api/chatService";
import { useChatStore } from "@/services/chatStore";
import { chatStyles } from "@/styles/chatStyles";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";

const Page = () => {
  const router = useRouter() as any;
  const item = router?.params;
  const [heightOfMessageBox, setHeightOfMessageBox] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const { loadMoreChats, loading, hasMoreChats } = usePaginatedChats(
    item?.conversation_id
  );
  const { conversations } = useChatStore();
  const currentChat = conversations?.find(
    (convo) => convo.conversationId === item?.conversation_id
  );

  useEffect(() => {
    if (!loading && hasMoreChats) {
      loadMoreChats();
    }
  }, []);

  return (
    <View style={chatStyles.container}>
      <ChatHeader item={item} />
      <Image
        source={require("@/assets/images/pattern.png")}
        style={chatStyles.background}
      />

      <Chat
        heightOfMessageBox={heightOfMessageBox}
        messages={currentChat?.messages || []}
        onLoadMore={() => !loading && hasMoreChats && loadMoreChats}
        loading={loading}
      />

      <SendButton
        item={item}
        isTyping={isTyping}
        setHeightOfMessageBox={setHeightOfMessageBox}
        setIsTyping={setIsTyping}
      />
    </View>
  );
};

export default Page;
