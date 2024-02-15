import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Box, Button, Text, ScrollView, ScaleFade, Spinner } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { RoomData, UserData } from 'models';
import { db, getUserData } from 'services';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getMediaQuery } from '../../styles';

export const ReportsHome = ({ navigation }: NativeStackHeaderProps) => {
  const isFocused = useIsFocused();
  const [user, setUser] = useState<UserData | undefined>(undefined);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const auth = getAuth();
  const isSmallMedium = getMediaQuery('isSmallMedium');

  useEffect(() => {
    setRooms([]);
    setUser(undefined);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        getUserData(user.uid)
          .then((user) => {
            setUser(user as UserData);
          })
          .then(() => loadRoom());
      } else {
        navigation.navigate('Login');
      }
    });
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

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 80,
      }}
    >
      {user ? (
        <ScaleFade in={user !== undefined}>
          <Box>
            <Text bold fontSize={30}>
              Coming soon
            </Text>
          </Box>
        </ScaleFade>
      ) : (
        <Spinner size="lg" />
      )}
    </ScrollView>
  );
};
