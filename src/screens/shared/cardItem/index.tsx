import {
  Box,
  Button,
  Text,
  Stack,
  HStack,
  Heading,
  AspectRatio,
  Center,
  IconButton,
  Icon,
  Menu,
  Pressable,
  Link,
} from 'native-base';
import React, { useMemo } from 'react';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import { RoomData } from 'models';
import { MaterialIcons } from '@expo/vector-icons';
import { arrayRemove, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from 'services';
import { useTranslation } from 'react-i18next';

interface Props {
  room: RoomData;
  ownerId: string;
  onRemove?: () => void;
  onDisable?: () => void;
}

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const CardItem: React.FC<Props> = ({
  room,
  ownerId,
  onRemove,
  onDisable,
}) => {
  const { t } = useTranslation();
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const background = useMemo(() => getRandomColor(), []);

  // const [room, setRoom] = useState<RoomData | undefined>(undefined);
  const removeRoom = async () => {
    await deleteDoc(doc(db, 'rooms', room.id))
      .then(async () => {
        await updateDoc(doc(db, `users`, ownerId), {
          rooms: arrayRemove({ [room.id]: room }),
        })
          .then(() => {
            onRemove?.();
            navigation.navigate('Home');
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const disableRoom = async () => {
    await updateDoc(doc(db, `rooms`, room.id), {
      disabled: room.disabled === true ? false : true,
    }).then(async () => {
      await updateDoc(doc(db, `users`, ownerId), {
        rooms: [
          {
            [ownerId]: {
              ...room,
              disabled: !room.disabled,
            },
          },
        ],
      }).then(() => onDisable?.());
    });
  };

  return (
    <>
      {room && background && (
        <Pressable
          w="100%"
          _web={{
            cursor: 'default',
          }}
        >
          {({ isHovered }) => {
            return (
              <Box
                minW={'80'}
                minHeight="250"
                rounded="lg"
                overflow="hidden"
                borderColor="coolGray.200"
                borderWidth="1"
                style={{
                  transform: [
                    {
                      scale: isHovered ? 0.98 : 1,
                    },
                  ],
                }}
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
                <Box>
                  <AspectRatio w="100%" ratio={16 / 9}>
                    <Box bg={background}></Box>
                  </AspectRatio>
                  {ownerId === room.owner.id && (
                    <Center position="absolute" top="0" right="0">
                      <Menu
                        trigger={(triggerProps) => {
                          return (
                            <IconButton
                              {...triggerProps}
                              icon={
                                <Icon
                                  as={<MaterialIcons name="more-vert" />}
                                  size="sm"
                                  color="white"
                                />
                              }
                            />
                          );
                        }}
                      >
                        <Menu.Item onPress={disableRoom}>
                          {room.disabled
                            ? t('cardItem.enable')
                            : t('cardItem.disable')}
                        </Menu.Item>
                        <Menu.Item onPress={removeRoom}>
                          {t('cardItem.remove')}
                        </Menu.Item>
                      </Menu>
                    </Center>
                  )}
                  <Center
                    bg="violet.500"
                    _dark={{
                      bg: 'violet.400',
                    }}
                    _text={{
                      color: 'warmGray.50',
                      fontWeight: '700',
                      fontSize: 'xs',
                    }}
                    position="absolute"
                    bottom="0"
                    px="3"
                    py="1.5"
                  >
                    QUIZ
                  </Center>
                </Box>
                <Stack p="4" space={3}>
                  <Stack space={2}>
                    <Heading size="md" ml="-1">
                      {room.name}
                    </Heading>
                    <Link
                      onPress={() =>
                        navigation.navigate('Users', {
                          userName: room.owner.userName,
                        })
                      }
                    >
                      <Text
                        bold
                        fontSize="xs"
                        _light={{
                          color: 'violet.500',
                        }}
                        _dark={{
                          color: 'violet.400',
                        }}
                        fontWeight="500"
                        ml="-0.5"
                        mt="-1"
                      >
                        {t('cardItem.createdBy').replace(
                          '${user}',
                          room.owner.name as string,
                        )}
                      </Text>
                    </Link>
                  </Stack>
                  <Text fontWeight="400">
                    {t('cardItem.questions').replace(
                      '${number}',
                      room.questions.length.toString(),
                    )}
                  </Text>
                  <HStack
                    alignItems="center"
                    space={4}
                    justifyContent="space-between"
                  >
                    <HStack alignItems="center">
                      {room.created_at && (
                        <Text
                          color="coolGray.600"
                          _dark={{
                            color: 'warmGray.200',
                          }}
                          fontWeight="400"
                        >
                          {t('cardItem.createdAt').replace(
                            '${date}',
                            (room.created_at as string).split(' ')[0],
                          )}
                        </Text>
                      )}
                    </HStack>
                  </HStack>
                  <HStack
                    alignItems="center"
                    space={4}
                    w="100%"
                    justifyContent="center"
                  >
                    <HStack alignItems="center" justifyContent="center">
                      <Button
                        variant="default"
                        onPress={() =>
                          navigation.navigate('Room', { roomId: room.id })
                        }
                      >
                        {t('cardItem.playQuiz')}
                      </Button>
                    </HStack>
                  </HStack>
                </Stack>
              </Box>
            );
          }}
        </Pressable>
      )}
    </>
  );
};
