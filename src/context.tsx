import { WebSocketProvider } from 'ethers';
import { createContext, type ReactNode, useContext } from 'react';

type ProviderProps = {
  socket: WebSocketProvider | null;
  children: ReactNode;
};

const context = createContext<WebSocketProvider | null>(null);

export const useSocket = () => {
  return useContext(context);
};

export const SocketProvider = ({ socket, children }: ProviderProps) => {
  return <context.Provider value={socket}>{children}</context.Provider>;
};
