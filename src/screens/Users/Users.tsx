import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import {
  Box,
  Text,
  ScrollView,
  Avatar,
  SimpleGrid,
  Spinner,
  Center,
  Flex,
  ScaleFade,
  Heading,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { UserData } from 'models';
import { db, getUserData } from 'services';
import { doc, getDoc } from 'firebase/firestore';
import { getMediaQuery } from '../../styles';
import { CardItem } from '../shared/CardItem';
import { useTranslation } from 'react-i18next';

interface UserName {
  username?: string;
}

export const Users = ({ route }: NativeStackHeaderProps) => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [user, setUser] = useState<UserData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isSmallMedium = getMediaQuery('isSmallMedium');

  const getUserNameData = async () => {
    const { username } = route.params as UserName;

    try {
      if (username && route.params) {
        const docRef = doc(db, 'usernames', username);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = await getUserData(docSnap.data().id);
          setUser(userData as UserData);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setUser(undefined);
    getUserNameData();
  }, [isFocused]);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        marginBottom: 80,
        alignItems: isSmallMedium ? undefined : 'center',
      }}
    >
      <Box mb="150">
        <Box
          bg="blue.600"
          py={20}
          w={!isSmallMedium ? '100vw' : '100%'}
          style={{ alignSelf: !isSmallMedium ? 'center' : 'center' }}
        />
        <Center position="absolute" alignSelf="center" top="50%">
          <Box
            rounded="lg"
            p={6}
            borderColor="coolGray.200"
            borderWidth="1"
            _dark={{
              borderColor: 'coolGray.600',
              backgroundColor: 'gray.700',
            }}
            _web={{
              shadow: 2,
              borderWidth: 0,
              cursor: 'default',
            }}
            _light={{
              backgroundColor: 'gray.50',
            }}
          >
            {user ? (
              <Flex alignItems="center">
                <Avatar
                  size="xl"
                  source={{
                    uri: user.photoUrl ?? '',
                  }}
                >
                  {user && user.name
                    ? user.name.match(/\b(\w)/g)?.join('')
                    : ''}
                </Avatar>
                <Text bold mt={1}>
                  {user.name}
                </Text>
              </Flex>
            ) : !user && !isLoading ? (
              <Text>{t('shared.userDontExist')}</Text>
            ) : (
              <Spinner size="lg" />
            )}
          </Box>
        </Center>
      </Box>
      {user ? (
        <ScaleFade in={user !== undefined}>
          <Box>
            <Heading mb={3}>User quiz</Heading>
            {user.rooms && user.rooms.length > 0 ? (
              <SimpleGrid
                columns={isSmallMedium ? 1 : 3}
                spacingX={10}
                spacingY={5}
                alignItems="center"
                mx={[10, 0]}
                mb={20}
              >
                {user.rooms.map((room, key) => {
                  return (
                    <Box key={key} minWidth="200px" mt={2}>
                      <CardItem
                        onDisable={getUserNameData}
                        onRemove={getUserNameData}
                        room={Object.values(room)[0]}
                        ownerId={user.id}
                      />
                    </Box>
                  );
                })}
              </SimpleGrid>
            ) : (
              <Text>{t('shared.userWithoutQuiz')}</Text>
            )}
          </Box>
        </ScaleFade>
      ) : (
        isLoading && <Spinner size="lg" />
      )}
    </ScrollView>
  );
};
