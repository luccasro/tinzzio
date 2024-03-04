import {
  Box,
  ScrollView,
  SimpleGrid,
  ScaleFade,
  Spinner,
  Heading,
  Center,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { RoomData } from 'models';
import { db } from 'services';
import { CardItem } from '../shared/CardItem';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMediaQuery } from '../../styles';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'context/useAuth';

export const Explore = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { user, isLoading, refreshData } = useAuth();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const auth = getAuth();
  const isSmallMedium = getMediaQuery('isSmallMedium');

  useEffect(() => {
    setRooms([]);
    loadRoom();
  }, [isFocused, auth]);

  const loadRoom = async () => {
    const ref = collection(db, 'rooms');
    const q = query(ref, where('privacy', '==', 'public'));
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
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 80,
      }}
    >
      <ScaleFade in={!!user}>
        <Box>
          {rooms && rooms.length > 0 && (
            <Box mt={10}>
              <Heading mb={3}>{t('explore.title')}</Heading>
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
      </ScaleFade>
    </ScrollView>
  );
};
