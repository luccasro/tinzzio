import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { RoomData, UserData } from 'models';
import { getUserData } from 'services';
import { auth } from '../../config';

interface AuthContextProps {
  user: UserData | undefined;
  rooms: RoomData[];
  isLoading: boolean;
  refreshData: () => void; // Function to refresh the context
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

type NavigateType = {
  navigate: (value: string) => void;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | undefined>(undefined);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigateType>();

  const refreshData = () => {
    // Reset state
    setRooms([]);
    setUser(undefined);
    setIsLoading(true);

    // Re-fetch user data
    onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        getUserData(authUser.uid)
          .then((userData) => {
            setUser(userData as UserData);
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
        navigation.navigate('Login');
      }
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AuthContext.Provider value={{ user, rooms, isLoading, refreshData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
