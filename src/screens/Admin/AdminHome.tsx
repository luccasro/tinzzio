import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Box, Text, ScrollView } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { getUserData } from 'services';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { UserData } from 'models';
import { getMediaQuery } from '../../styles';
import { CategoryAdmin } from './Category';
import { DocumentData } from 'firebase/firestore';

export const AdminHome = ({ navigation }: NativeStackHeaderProps) => {
  const isFocused = useIsFocused();
  const [user, setUser] = useState<UserData | DocumentData | undefined>(
    undefined,
  );
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const auth = getAuth();
  const isSmallMedium = getMediaQuery('isSmallMedium');

  useEffect(() => {
    setUser(undefined);
    setIsAdmin(undefined);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        getUserData(user.uid).then((user) => {
          setUser(user);
        });
      } else {
        navigation.navigate('Login');
      }
    });
  }, [isFocused, auth]);

  useEffect(() => {
    if (user) {
      if (user?.admin) {
        setIsAdmin(true);
      } else {
        navigation.navigate('Home');
      }
    }
  }, [user]);

  if (!isAdmin) {
    return null;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: isSmallMedium ? undefined : 'center',
      }}
    >
      <Text>Hello Admnistrator</Text>
      <Box alignSelf="center">
        <CategoryAdmin />
      </Box>
    </ScrollView>
  );
};
