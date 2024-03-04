import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import {
  Box,
  Button,
  ScrollView,
  SimpleGrid,
  ScaleFade,
  Spinner,
  Heading,
  Center,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { LoadRoom } from '../Rooms/LoadRoom';
import { db } from 'services';
import { CardItem } from '../shared/CardItem';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { RoomData } from 'models';
import { getMediaQuery } from '../../styles';
import { useAuth } from 'context/useAuth';

export const Dashboard = ({ navigation }: NativeStackHeaderProps) => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const auth = getAuth();
  const isSmallMedium = getMediaQuery('isSmallMedium');
  const { user, isLoading, refreshData } = useAuth();

  useEffect(() => {
    setRooms([]);
    loadRoom();
  }, [isFocused, auth]);

  const loadRoom = async () => {
    const ref = collection(db, 'rooms');
    const q = query(ref, where('privacy', '==', 'public'), limit(10));
    const querySnapshot = await getDocs(q);
    const tempRoom: RoomData[] = [];

    querySnapshot.forEach((doc) => {
      tempRoom.push(doc.data() as RoomData);
    });

    setRooms(tempRoom);
  };

  if (!user || isLoading) {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: isSmallMedium ? undefined : 'center',
        }}
      >
        <Center width="100%" height="100%">
          <Spinner size="lg" />
        </Center>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: isSmallMedium ? undefined : 'center',
      }}
    >
      <ScaleFade in={user !== undefined}>
        <>
          <LoadRoom />
          <Box style={{ marginHorizontal: 10 }}>
            <Box>
              <Button
                style={{ alignSelf: 'center' }}
                variant="default"
                mt={4}
                onPress={() => navigation.navigate('CreateRoom')}
              >
                {t('dashboard.createQuiz')}
              </Button>
            </Box>
            {rooms && rooms.length > 0 && (
              <Box mt={10}>
                <Heading mb={10} alignSelf="center">
                  {t('dashboard.recommendations')}
                </Heading>
                <SimpleGrid
                  columns={isSmallMedium ? 1 : 3}
                  spacingX={10}
                  spacingY={5}
                  alignItems="center"
                  mx={[10, 0]}
                  mb={200}
                >
                  {rooms.map((room, key) => {
                    return (
                      <Box key={key} minWidth="200px" mt={2}>
                        <CardItem
                          onDisable={refreshData}
                          onRemove={refreshData}
                          room={room}
                          ownerId={user.id}
                        />
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            )}
          </Box>
        </>
      </ScaleFade>
    </ScrollView>
  );
};
