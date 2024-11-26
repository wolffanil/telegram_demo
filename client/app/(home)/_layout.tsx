import { WSProvider } from "@/services/sockets/WSProvider";
import { Stack } from "expo-router";
import * as Notification from "expo-notifications";
import { useEffect, useRef } from "react";
import { registerForPushNotificationsAsync } from "@/utils/NotificationHandler";
import { registerDeviceToken } from "@/services/api/authService";

Notification.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Layout = () => {
  const notificationListener = useRef<Notification.Subscription>();
  const responseListener = useRef<Notification.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(async (token) => await registerDeviceToken(token ?? ""))
      .catch((error: any) => console.log("Error Device Token", error));

    notificationListener.current = Notification.addNotificationReceivedListener(
      (notification) => {
        console.log(notification);
      }
    );

    responseListener.current =
      Notification.addNotificationResponseReceivedListener((notification) => {
        console.log(notification);
      });

    return () => {
      notificationListener.current &&
        Notification.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notification.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <WSProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="search" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notification" />
        <Stack.Screen name="contacts" />
      </Stack>
    </WSProvider>
  );
};

export default Layout;
