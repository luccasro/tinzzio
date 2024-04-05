import { useNavigation } from '@react-navigation/native';
import {
  Box,
  Button,
  Center,
  Input,
  Text,
  useColorModeValue,
} from 'native-base';
import React, { useState } from 'react';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getMediaQuery } from '../../styles';

export const LoadRoom = () => {
  const [roomId, setRoomId] = useState('');
  const { t } = useTranslation();

  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const isSmallMedium = getMediaQuery('isSmallMedium');

  const loadRoom = () => {
    navigation.navigate('Room', { roomId: roomId });
  };

  return (
    <>
      <Box mb="150">
        <Box
          bg="purple.600"
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
            <Text bold>{t('loadQuiz.title')}</Text>
            <Input
              minWidth="250px"
              color={useColorModeValue('black', 'black')}
              placeholder={t('loadQuiz.placeholder')}
              mt={5}
              size="lg"
              value={roomId}
              onChangeText={setRoomId}
            />
            <Button isDisabled={roomId === ''} onPress={loadRoom} mt={5}>
              {t('loadQuiz.loadRoomButton')}
            </Button>
          </Box>
        </Center>
      </Box>
    </>
  );
};
