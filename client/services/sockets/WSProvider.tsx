import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { tokenStorage } from "../storage";
import { SOCKET_URL } from "../config";
import { refresh_token } from "../api/apiInterceptors";

interface WSSerivce {
  inializeSocket: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, cb: (data: any) => void) => void;
  off: (event: string) => void;
  removeListener: (listenerName: string) => void;
  updateAccessToken: () => void;
}

const WSContext = createContext<WSSerivce | undefined>(undefined);

export const WSProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [socketAccessToken, setSocketAccessToken] = useState<string | null>(
    null
  );
  const [changedToken, setChangedToken] = useState<boolean>(false);
  const socket = useRef<Socket>();

  useEffect(() => {
    const token = tokenStorage.getString("accessToken") as any;
    setSocketAccessToken(token);
  }, [changedToken]);

  useEffect(() => {
    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      extraHeaders: {
        access_token: socketAccessToken || "",
      },
    });

    if (socketAccessToken) {
      socket.current.on("connect_error", (error) => {
        if (error.message === "Authentication error") {
          refresh_token();
        }
      });
    }

    return () => {
      socket.current?.disconnect();
    };
  }, [socketAccessToken]);

  const emit = (event: string, data: any = {}) => {
    socket.current?.emit(event, data);
  };

  const on = (event: string, cb: (data: any) => void) => {
    socket?.current?.on(event, cb);
  };

  const off = (event: string) => {
    socket?.current?.removeListener(event);
  };

  const removeListener = (listenerName: string) => {
    socket?.current?.removeListener(listenerName);
  };

  const updateAccessToken = () => {
    setChangedToken(!changedToken);
  };

  const socketService: WSSerivce = {
    inializeSocket: () => {},
    emit,
    on,
    off,
    removeListener,
    updateAccessToken,
  };

  return (
    <WSContext.Provider value={socketService}>{children}</WSContext.Provider>
  );
};

export const useWS = (): WSSerivce => {
  const socketService = useContext(WSContext);
  if (!socketService) {
    throw new Error("useWS must be used within a wsprovider");
  }

  return socketService;
};
