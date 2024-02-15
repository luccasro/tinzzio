import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import {
  Button,
  Text,
  ScrollView,
  Input,
  Spinner,
  Heading,
  Center,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { db } from 'services';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from 'context/useAuth';
import { useTranslation } from 'react-i18next';
import { getMediaQuery } from 'styles';

export const Settings = ({ navigation }: NativeStackHeaderProps) => {
  const { t } = useTranslation();
  const { user, isLoading, refreshData } = useAuth();
  const [userName, setUserName] = useState('');
  const isSmallMedium = getMediaQuery('isSmallMedium');

  const [userNameAvailable, setUserNameAvailable] = useState<
    boolean | undefined
  >(undefined);

  useEffect(() => {
    if (userName.length > 0) {
      checkUserName();
    } else {
      setUserNameAvailable(undefined);
    }
  }, [userName]);

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

  const checkUserName = async () => {
    setUserNameAvailable(undefined);
    const username = userName.toLowerCase();
    const docRef = doc(db, 'usernames', username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserNameAvailable(false);
    } else {
      setUserNameAvailable(true);
    }
  };

  const updateUserName = async () => {
    const refUsers = doc(db, 'users', user.id);
    const oldUserName = user.userName;

    await updateDoc(refUsers, {
      userName: userName,
    }).then(
      async () =>
        await deleteDoc(doc(db, 'usernames', oldUserName))
          .then(
            async () =>
              await setDoc(doc(db, 'usernames', userName), { id: user.id }),
          )
          .then(() => {
            refreshData();
            navigation.navigate('Home');
          }),
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
      }}
    >
      <Heading mb={8}>Settings</Heading>
      <Text bold mt={1}>
        {t('settings.currentUsername')} {user.userName}
      </Text>
      <Input
        minWidth="250px"
        mt={4}
        value={userName}
        onChangeText={setUserName}
      />
      {userName.length > 2 && (
        <Text bold>
          {userNameAvailable === true
            ? `${userName} ${t('settings.isAvailable')}`
            : userNameAvailable === false
            ? `${userName} ${t('settings.notAvailable')}`
            : '...'}
        </Text>
      )}
      <Button
        mt={4}
        isDisabled={userName.length <= 2 || !userNameAvailable}
        onPress={updateUserName}
      >
        {t('settings.changeUsername')}
      </Button>
      <Button
        mt={4}
        style={{ alignSelf: 'center' }}
        onPress={() =>
          navigation.navigate('Users', { userName: user.userName })
        }
      >
        {t('settings.viewProfile')}
      </Button>
    </ScrollView>
  );
};
