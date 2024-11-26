import SearchBar from "@/components/search/SearchBar";
import UserItem from "@/components/search/UserItem";
import { getAllConversations } from "@/services/api/chatService";
import { addFriend, searchUsers, unfriend } from "@/services/api/userService";
import { searchStyles } from "@/styles/searchStyles";
import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchData, setSearchData] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 3) {
      searchUser();
    }
  }, [searchQuery]);

  useEffect(() => {
    getAllConversations();
  }, []);

  const renderUsers = ({ item }: any) => {
    return (
      <UserItem
        onSendRequests={async () => {
          await addFriend(item?.id);
          searchUser();
        }}
        onUnfriend={async () => {
          await unfriend(item?.id);
          searchUser();
          await getAllConversations();
        }}
        item={item}
      />
    );
  };

  const searchUser = async () => {
    const data = await searchUsers(searchQuery);
    setSearchData(data);
  };

  return (
    <View style={searchStyles.container}>
      <SearchBar
        title="Search"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <FlatList
        data={searchData}
        renderItem={renderUsers}
        keyExtractor={(item: any) => item.id}
        initialNumToRender={5}
        contentContainerStyle={searchStyles.scrollContainer}
      />
    </View>
  );
};

export default Page;
