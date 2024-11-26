import axios from "axios";
import { BASE_URL } from "../config";
import { tokenStorage } from "../storage";
import { resetAndNavigate } from "@/utils/LibraryHelpers";

export const appAxios = axios.create({
  baseURL: BASE_URL,
});

export const refresh_token = async () => {
  try {
    const refreshToken = tokenStorage.getString("refreshToken");
    const response = await axios.post(`${BASE_URL}/oauth/refresh-token`, {
      refresh_token: refreshToken,
    });
    const new_access_token = response.data.access_token;
    const new_refresh_token = response.data.refresh_token;
    tokenStorage.set("accessToken", new_access_token);
    tokenStorage.set("refreshToken", new_refresh_token);
    return new_access_token;
  } catch (error) {
    tokenStorage.clearAll();
    resetAndNavigate("/(auth)/signin");
  }
};

appAxios.interceptors.request.use(async (config) => {
  const accessToken = tokenStorage.getString("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

appAxios.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const newAccessToken = await refresh_token();
        if (newAccessToken) {
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(error.config);
        }
      } catch (error) {
        console.log("Error Refreshign Token");
      }
    }

    if (error.response && error.response.status !== 401) {
      const errorMessage = error.response.data.msg || "Token Expired";
    }

    return Promise.reject(error);
  }
);
