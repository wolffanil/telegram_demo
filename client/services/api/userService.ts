import { useUserStore } from "../userStore";
import { appAxios } from "./apiInterceptors";

export const getAllFriendRequests = async () => {
  try {
    const apiRes = await appAxios.get("/request/list");
    const { setRequests } = useUserStore.getState();

    setRequests(apiRes.data);
  } catch (error) {
    console.log("Get all conversions", error);
  }
};

export const searchUsers = async (searchQuery: string) => {
  try {
    const apiRes = await appAxios.get(`/user/search/${searchQuery}`);
    return apiRes.data;
  } catch (error) {
    console.log("Get search users", error);
    return [];
  }
};

export const addFriend = async (receiverId: string) => {
  try {
    const apiRes = await appAxios.post("/request/send", {
      receiverId: receiverId,
    });
  } catch (error) {
    throw error;
  }
};

export const unfriend = async (friendId: string) => {
  try {
    const apiRes = await appAxios.post("/request/unfriend", {
      friendId,
    });
  } catch (error) {
    throw error;
  }
};

export const connectedFriends = async () => {
  try {
    const apiRes = await appAxios.get("/user/connected");
  } catch (error) {
    return [];
  }
};

export const onHandleRequest = async (
  requestId: string,
  action: "ACCEPT" | "REJECT"
) => {
  try {
    const apiRes = await appAxios.post("/request/handle", {
      requestId,
      action,
    });
  } catch (error) {
    throw error;
  }
};
