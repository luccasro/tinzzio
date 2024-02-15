import { useNavigation } from '@react-navigation/native';
import {
  Box,
  Button,
  Center,
  Flex,
  Icon,
  IconButton,
  Input,
  Modal,
  ScrollView,
  Spinner,
  Text,
  Tooltip,
} from 'native-base';
import React, { useState } from 'react';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { RoomData } from 'models';
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { db } from 'services';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'context/useAuth';
import { getMediaQuery } from 'styles';

type QuestionOptions = 'a' | 'b' | 'c' | 'd';

type QuestionField = QuestionOptions | 'name' | 'correctOption';

const initialQuestions = [
  {
    name: '',
    a: '',
    b: '',
    c: '',
    d: '',
    correctOption: '',
  },
];

export const CreateRoom: React.FC = () => {
  const { t } = useTranslation();
  const navigation: NavigationProp<ParamListBase> = useNavigation();
  const { user, isLoading, refreshData } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [questions, setQuestions] = useState(initialQuestions);
  const [roomPrivacy, setRoomPrivacy] = useState<'public' | 'private' | 'link'>(
    'public',
  );
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const isSmallMedium = getMediaQuery('isSmallMedium');

  const isDisabled = questions.some(
    (question) =>
      !question.name.length ||
      !question.a ||
      !question.b ||
      !question.c ||
      !question.d ||
      !question.correctOption,
  );

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
  const createRoom = async () => {
    const docRef = await addDoc(collection(db, 'rooms'), {});

    const room: RoomData = {
      id: docRef.id,
      name: roomName,
      owner: {
        id: user.id,
        userName: user.userName as string,
        name: user.name as string,
      },
      created_at: new Date().toLocaleString(),
      disabled: false,
      privacy: roomPrivacy,
      questions: questions,
    };
    await setDoc(doc(db, 'rooms', docRef.id), room);

    await updateDoc(doc(db, `users`, user.id), {
      rooms: arrayUnion({ [docRef.id]: room }),
    }).then(() => {
      refreshData();
      navigation.navigate('Room', { roomId: docRef.id });
    });
  };

  const onChangeInput = (
    newValue: string,
    input: QuestionField,
    index: number,
  ) => {
    const values = [...questions];
    values[index] = {
      name: input === 'name' ? newValue : values[index].name,
      a: input === 'a' ? newValue : values[index].a,
      b: input === 'b' ? newValue : values[index].b,
      c: input === 'c' ? newValue : values[index].c,
      d: input === 'd' ? newValue : values[index].d,
      correctOption:
        input === 'correctOption' ? newValue : values[index].correctOption,
    };
    setQuestions(values);
  };

  const addQuestion = () => {
    const newQuestion = {
      name: '',
      a: '',
      b: '',
      c: '',
      d: '',
      correctOption: '',
    };
    setQuestions((oldQuestions) => [...oldQuestions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const values = [...questions];
    values.splice(index, 1);
    setQuestions(values);
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
      {user.id && (
        <>
          <Box px={[4, 0]} w={['100%', '']}>
            <Text bold fontSize={24} mt={5}>
              {t('createRoom.quizName')}
            </Text>
            <Input
              mt={5}
              size="lg"
              value={roomName}
              onChangeText={setRoomName}
            />
            <Flex flexDirection="row" justifyContent="flex-end">
              <Button
                my={5}
                variant="default"
                style={{ alignSelf: 'center' }}
                leftIcon={
                  <Icon as={MaterialCommunityIcons} name="cogs" size="sm" />
                }
                onPress={() => setShowSettings(true)}
              >
                {t('createRoom.settings')}
              </Button>
            </Flex>
            {questions.map((question, index) => (
              <Box key={index}>
                {index > 0 && (
                  <Flex flexDirection="row" justifyContent="flex-end">
                    <Button
                      mt={5}
                      style={{ alignSelf: 'center' }}
                      leftIcon={<Icon as={Ionicons} name="remove" size="sm" />}
                      colorScheme="danger"
                      onPress={() => removeQuestion(index)}
                    >
                      {t('createRoom.removeQuestion', { index: index + 1 })}
                    </Button>
                  </Flex>
                )}
                <Text bold fontSize={24} mt={2}>
                  {t('createRoom.question', { index: index + 1 })}
                </Text>
                <Input
                  mt={5}
                  size="lg"
                  value={questions[index].name}
                  onChangeText={(text: string) =>
                    onChangeInput(text, 'name', index)
                  }
                />
                <Flex
                  flexDirection={['row', 'row']}
                  justifyContent="center"
                  flexWrap="wrap"
                  mt={5}
                >
                  <Flex w="50%" mb={4} pr={4}>
                    <Box
                      bg="white"
                      rounded="sm"
                      overflow="hidden"
                      borderColor="coolGray.200"
                      borderWidth="1"
                      py={4}
                      px={4}
                      justifyContent="center"
                      _web={{
                        shadow: 2,
                        borderWidth: 0,
                      }}
                    >
                      <Flex
                        px={4}
                        w="100%"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Flex w="100%">
                          <Input
                            variant="unstyled"
                            size="lg"
                            value={questions[index].a}
                            placeholder={t('createRoom.optionA')}
                            onChangeText={(text: string) =>
                              onChangeInput(text, 'a', index)
                            }
                          />
                        </Flex>
                        <Flex>
                          <IconButton
                            onPress={() =>
                              onChangeInput('a', 'correctOption', index)
                            }
                            icon={<Icon as={AntDesign} name="checkcircle" />}
                            borderRadius="full"
                            _icon={{
                              color:
                                question.correctOption === 'a'
                                  ? 'green.600'
                                  : 'coolGray.700',
                              size: 'sm',
                            }}
                            _hover={{
                              bg: 'green.600:alpha.20',
                              color: 'blue.600',
                            }}
                            _pressed={{
                              bg: 'green.600:alpha.20',
                              color: 'blue.800',
                            }}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  </Flex>
                  <Flex w="50%" mb={4}>
                    <Box
                      bg="white"
                      rounded="sm"
                      overflow="hidden"
                      borderColor="coolGray.200"
                      borderWidth="1"
                      py={4}
                      px={4}
                      justifyContent="center"
                      _web={{
                        shadow: 2,
                        borderWidth: 0,
                      }}
                    >
                      <Flex
                        px={4}
                        w="100%"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Flex w="100%">
                          <Input
                            variant="unstyled"
                            size="lg"
                            value={questions[index].b}
                            placeholder={t('createRoom.optionB')}
                            onChangeText={(text: string) =>
                              onChangeInput(text, 'b', index)
                            }
                          />
                        </Flex>
                        <Flex>
                          <IconButton
                            onPress={() =>
                              onChangeInput('b', 'correctOption', index)
                            }
                            icon={<Icon as={AntDesign} name="checkcircle" />}
                            borderRadius="full"
                            _icon={{
                              color:
                                questions[index].correctOption === 'b'
                                  ? 'green.600'
                                  : 'coolGray.700',
                              size: 'sm',
                            }}
                            _hover={{
                              bg: 'green.600:alpha.20',
                              color: 'blue.600',
                            }}
                            _pressed={{
                              bg: 'green.600:alpha.20',
                              color: 'blue.800',
                            }}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  </Flex>
                  <Flex w="50%" pr={4}>
                    <Box
                      bg="white"
                      rounded="sm"
                      overflow="hidden"
                      borderColor="coolGray.200"
                      borderWidth="1"
                      py={4}
                      px={4}
                      justifyContent="center"
                      _web={{
                        shadow: 2,
                        borderWidth: 0,
                      }}
                    >
                      <Flex
                        px={4}
                        w="100%"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Flex w="100%">
                          <Input
                            variant="unstyled"
                            size="lg"
                            value={questions[index].c}
                            placeholder={t('createRoom.optionC')}
                            onChangeText={(text: string) =>
                              onChangeInput(text, 'c', index)
                            }
                          />
                        </Flex>
                        <Flex>
                          <IconButton
                            onPress={() =>
                              onChangeInput('c', 'correctOption', index)
                            }
                            icon={<Icon as={AntDesign} name="checkcircle" />}
                            borderRadius="full"
                            _icon={{
                              color:
                                questions[index].correctOption === 'c'
                                  ? 'green.600'
                                  : 'coolGray.700',
                              size: 'sm',
                            }}
                            _hover={{
                              bg: 'green.600:alpha.20',
                              color: 'blue.600',
                            }}
                            _pressed={{
                              bg: 'green.600:alpha.20',
                              color: 'blue.800',
                            }}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  </Flex>
                  <Flex w="50%">
                    <Box
                      bg="white"
                      rounded="sm"
                      overflow="hidden"
                      borderColor="coolGray.200"
                      borderWidth="1"
                      py={4}
                      px={4}
                      justifyContent="center"
                      _web={{
                        shadow: 2,
                        borderWidth: 0,
                      }}
                    >
                      <Flex
                        px={4}
                        w="100%"
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Flex w="100%">
                          <Input
                            variant="unstyled"
                            size="lg"
                            value={questions[index].d}
                            placeholder={t('createRoom.optionD')}
                            onChangeText={(text: string) =>
                              onChangeInput(text, 'd', index)
                            }
                          />
                        </Flex>
                        <Flex>
                          <IconButton
                            onPress={() =>
                              onChangeInput('d', 'correctOption', index)
                            }
                            icon={<Icon as={AntDesign} name="checkcircle" />}
                            borderRadius="full"
                            _icon={{
                              color:
                                questions[index].correctOption === 'd'
                                  ? 'green.600'
                                  : 'coolGray.700',
                              size: 'sm',
                            }}
                            _hover={{
                              bg: 'green.600:alpha.20',
                              color: 'blue.600',
                            }}
                            _pressed={{
                              bg: 'green.600:alpha.20',
                              color: 'blue.800',
                            }}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Box>
          <Button
            leftIcon={
              <Icon as={Ionicons} name="add-circle-outline" size="sm" />
            }
            onPress={addQuestion}
            mt={5}
          >
            {t('createRoom.addQuestion')}
          </Button>
          <Button isDisabled={isDisabled} onPress={createRoom} mt={5}>
            {t('createRoom.finishCreateQuiz')}
          </Button>
          <Button
            mt={4}
            variant="outline"
            onPress={() => navigation.navigate('Dashboard')}
          >
            {t('room.backDashboard')}
          </Button>

          <Modal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            size="xl"
          >
            <Modal.Content>
              <Modal.CloseButton />
              <Modal.Header>
                <Text variant="modalHeader">{t('createRoom.settings')}</Text>
              </Modal.Header>
              <Modal.Body my={10}>
                <Flex flexDirection="row">
                  <Flex flexDirection="row" alignItems="center">
                    <Text bold fontSize={[14, 18]}>
                      {t('createRoom.privacy')}
                    </Text>
                    <Box>
                      <Tooltip label={t('createRoom.privacyTooltip')}>
                        <IconButton
                          ml={1}
                          p={0}
                          icon={
                            <Icon
                              as={MaterialCommunityIcons}
                              name="help-circle-outline"
                            />
                          }
                          _icon={{
                            color: 'coolGray.700',
                            size: '20px',
                          }}
                        />
                      </Tooltip>
                    </Box>
                  </Flex>

                  <Flex flexDirection="row" justifyContent="center">
                    <IconButton
                      ml={4}
                      mr={4}
                      icon={<Icon as={MaterialCommunityIcons} name="web" />}
                      onPress={() => setRoomPrivacy('public')}
                      borderRadius="full"
                      bg={
                        roomPrivacy === 'public'
                          ? 'green.600:alpha.20'
                          : undefined
                      }
                      _icon={{
                        color:
                          roomPrivacy === 'public'
                            ? 'green.600'
                            : 'coolGray.700',
                        size: 'md',
                      }}
                      _hover={{
                        bg: 'green.600:alpha.20',
                      }}
                      _pressed={{
                        bg: 'green.600:alpha.20',
                      }}
                    />
                    <IconButton
                      mr={4}
                      icon={<Icon as={MaterialCommunityIcons} name="lock" />}
                      onPress={() => setRoomPrivacy('private')}
                      borderRadius="full"
                      bg={
                        roomPrivacy === 'private'
                          ? 'green.600:alpha.20'
                          : undefined
                      }
                      _icon={{
                        color:
                          roomPrivacy === 'private'
                            ? 'green.600'
                            : 'coolGray.700',
                        size: 'md',
                      }}
                      _hover={{
                        bg: 'green.600:alpha.20',
                      }}
                      _pressed={{
                        bg: 'green.600:alpha.20',
                      }}
                    />
                    <IconButton
                      mr={4}
                      icon={
                        <Icon as={MaterialCommunityIcons} name="link-lock" />
                      }
                      onPress={() => setRoomPrivacy('link')}
                      borderRadius="full"
                      bg={
                        roomPrivacy === 'link'
                          ? 'green.600:alpha.20'
                          : undefined
                      }
                      _icon={{
                        color:
                          roomPrivacy === 'link' ? 'green.600' : 'coolGray.700',
                        size: 'md',
                      }}
                      _hover={{
                        bg: 'green.600:alpha.20',
                      }}
                      _pressed={{
                        bg: 'green.600:alpha.20',
                      }}
                    />
                  </Flex>
                </Flex>
              </Modal.Body>
              <Modal.Footer>
                <Button.Group space={2}>
                  <Button
                    variant="ghost"
                    colorScheme="blueGray"
                    onPress={() => {
                      setShowSettings(false);
                    }}
                  >
                    {t('createRoom.cancel')}
                  </Button>
                  <Button
                    onPress={() => {
                      setShowSettings(false);
                    }}
                  >
                    {t('createRoom.save')}
                  </Button>
                </Button.Group>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};
