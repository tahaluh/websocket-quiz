import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";

export type User = {
  id: string;
  username: string;
};

export interface UserContextInterface {
  user: User | undefined;
  signed: boolean;
  setUser: Dispatch<SetStateAction<User | undefined>>;
}

const defaultState = {
  user: undefined,
  signed: false,
  setUser: (user: User) => {},
} as UserContextInterface;

export const UserContext = createContext(defaultState);

type UserProviderProps = {
  children: ReactNode;
};

export default function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>();

  return (
    <UserContext.Provider value={{ user, setUser, signed: !!user }}>
      {children}
    </UserContext.Provider>
  );
}
