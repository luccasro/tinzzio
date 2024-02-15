import {
  NavigationProp,
  ParamListBase,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Center, HStack, Spinner } from 'native-base';
import React, { useEffect } from 'react';
import { useRoute } from '@react-navigation/native';

export const Home = () => {
  const isFocused = useIsFocused();
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const auth = getAuth();
  const route = useRoute();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('Dashboard');
      } else if (route.name !== 'Word') {
        navigation.navigate('Login');
      }
    });
  }, [isFocused]);

  return (
    <Center flex={1} px="3">
      <HStack space={2} alignItems="center">
        <Spinner size="lg" />
      </HStack>
    </Center>
  );
};
