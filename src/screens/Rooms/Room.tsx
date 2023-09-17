import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Alert, Box, Button, Center, Flex, HStack, IconButton, Spinner, Text, useTheme, useToast, VStack, ScrollView, Input, Pressable, Icon, Badge } from "native-base";
import React, { useEffect, useState } from "react";
import * as Clipboard from 'expo-clipboard';
import { NavigationProp, ParamListBase, useIsFocused, useNavigation } from "@react-navigation/native";
import { QuestionValues, RoomData, RoomParticipants } from "models";
import { db, getUserData } from "services";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Trans } from "react-i18next";
import i18next from "i18next";

interface RoomId {
    roomId: string;
}

export const Room = ({ route }: NativeStackHeaderProps) => {
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const [room, setRoom] = useState<RoomData | undefined>(undefined);
    const [roomExists, setRoomExists] = useState<boolean | undefined>(undefined);
    const [roomId, setRoomId] = useState<RoomId | undefined>(route.params as RoomId);
    const [userLoggedId, setUserLoggedId] = useState<string | undefined>(undefined);
    const [answeredQuestion, setAnsweredQuestion] = useState<QuestionValues[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [finished, setFinished] = useState<boolean | undefined>(false);
    const [isStarted, setIsStarted] = useState<boolean>(false);


    const toast = useToast();
    const isFocused = useIsFocused();


    useEffect(() => {
        resetRoom()
        if (isFocused) {
            setRoomId(route.params as RoomId)
        }

        const getRoom = async (roomId: RoomId) => {
            const docRef = doc(db, "rooms", (roomId.roomId).replace('room-', ''));
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                setRoomExists(false)
            }
            else {
                setRoom(docSnap.data() as RoomData)
                getUserData().then(user => {
                    setUserLoggedId(user.id)

                })
            }
        }

        if (roomId && isFocused) {
            getRoom(roomId)
        }
    }, [roomId, isFocused]);

    // check if user already answered and load results
    useEffect(() => {
        if (room !== undefined && userLoggedId) {
            if (room.participants && room.participants.length > 0) {
                const userIndex = room.participants.findIndex(it => it.id === userLoggedId);

                if (userIndex !== -1 && userIndex !== undefined) {
                    if (room.participants[userIndex]?.answers) {
                        setAnsweredQuestion(room.participants[userIndex].answers as QuestionValues[])
                        setFinished(true)
                        setRoomExists(true)
                    }
                }
                else {
                    setRoomExists(true)
                }
            }
            else {
                setRoomExists(true)
            }
        }
    }, [room, userLoggedId]);

    const goBack = () => {
        resetRoom()
        navigation.navigate('Home');
    }

    const resetRoom = () => {
        setRoom(undefined);
        setRoomExists(undefined);
        setRoomId(undefined);
        setAnsweredQuestion([]);
        setFinished(false);
        setCurrentIndex(0);
        setUserLoggedId(undefined);
        setIsStarted(false)
    }

    const checkQuestion = (option: string, index: number) => {
        //check if is correct then add in the index of array if is correct
        let values = [...answeredQuestion]
        if (option === room?.questions[index].correctOption) {
            values[index] = {
                value: option,
                isCorrect: true
            };
            setAnsweredQuestion(values);
        }
        else {
            values[index] = {
                value: option,
                isCorrect: false
            };
            setAnsweredQuestion(values);
        }
    }

    const nextQuestion = async () => {
        if (room && roomId) {
            if (currentIndex >= room?.questions.length - 1) {
                setFinished(true);
                sendQuestions();
            }
            else {
                setCurrentIndex(currentIndex + 1);
            }
        }
    }

    const sendQuestions = async () => {
        if (room && roomId && userLoggedId) {
            const docRef = doc(db, "rooms", (roomId.roomId).replace('room-', ''));

            const updateParticipant = async (values?: RoomParticipants[]) => {
                await updateDoc(docRef, {
                    participants: values ?? arrayUnion({
                        id: userLoggedId,
                        answers: answeredQuestion
                    })
                });
            }
            if (room.participants && room.participants.length > 0) {
                const userIndex = room.participants.findIndex(it => it.id === userLoggedId);
                //if user already answered update the answers
                if (userIndex !== -1 && userIndex !== undefined) {
                    let values = [...room.participants]
                    values[userIndex].answers = answeredQuestion
                    updateParticipant(values);
                }
                //else include user as participant
                else {
                    updateParticipant();
                }
            }
            //if participants list is null
            else {
                updateParticipant();
            }
        }
    }

    const restart = async () => {
        resetRoom();
        if (room && roomId && userLoggedId) {
            const docRef = doc(db, "rooms", (roomId.roomId).replace('room-', ''));
            if (room.participants) {
                const userIndex = room.participants.findIndex(it => it.id === userLoggedId);
                if (userIndex !== undefined) {
                    await updateDoc(docRef, {
                        participants: arrayRemove({
                            id: userLoggedId,
                            answers: answeredQuestion
                        })
                    }).then(() => setRoomId(route.params as RoomId))
                        .catch(error => console.log(error))
                }
            }
        }
    }

    const copyCLipboard = () => {
        if (roomId) {
            Clipboard.setString(roomId.roomId);
            toast.show({
                render: () => {
                    return (
                        <Box bg="blue.500" px="2" py="2" rounded="sm" mb={5}>
                            <Text color="white" bold fontSize={16}>Quiz PIN copied successfully!</Text>
                        </Box>
                    )
                },
            })
        }
    }

    return (
        <>
            <ScrollView contentContainerStyle={{
                flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 10, width: "100%"
            }}>
                {(room && roomExists === true) ? (
                    <>
                        {!room.disabled ? (
                            <>
                                {!finished ? (
                                    <>
                                        <Box px={[4, 0]} w={["100%", ""]}>
                                            {!isStarted && (
                                                <>
                                                    <Text fontSize={[20, 26]} mb={10} alignSelf='center' bold>{room?.name}</Text>
                                                    <Button mt={4} px={10} py={3} alignSelf='center' variant="default" onPress={() => setIsStarted(true)}>Start Quiz!</Button>
                                                </>
                                            )}
                                            {isStarted && (
                                                room.questions.map((question, index) => (
                                                    <Box key={"question-" + index}>
                                                        {currentIndex === index && (
                                                            <>
                                                                <VStack>
                                                                    <Badge
                                                                        bg="white"
                                                                        rounded="6px"
                                                                        mb={-3}
                                                                        px={3}
                                                                        zIndex={1}
                                                                        variant="solid"
                                                                        alignSelf="center"
                                                                        _text={{
                                                                            fontSize: 14,
                                                                            color: "purple.600",
                                                                            fontWeight: "bold"
                                                                        }}
                                                                    >
                                                                        {index + 1 + "/" + room?.questions.length}
                                                                    </Badge>
                                                                    <Box
                                                                        p="2"
                                                                        bg="purple.600"
                                                                        borderRadius="sm"
                                                                    >
                                                                        <Text fontSize={[16, 30]} bold color="white">{question.name}</Text>

                                                                    </Box>
                                                                </VStack>
                                                                {/* ------------------------------------- QUESTIONS ------------------------------------- */}
                                                                <Flex mt={6} direction="row" w="full" justifyContent="center" alignItems="center" flexWrap="wrap">
                                                                    {question.a && (
                                                                        <Flex w="50%"
                                                                            mb={4}
                                                                            pr={[2, 4]}>
                                                                            <Box
                                                                                w="100%"
                                                                                justifyContent="center">
                                                                                <Pressable
                                                                                    onPress={() => checkQuestion('a', index)}>
                                                                                    {({ isHovered, isPressed }) => {
                                                                                        return (
                                                                                            <Box w="100%"
                                                                                                backgroundColor={(answeredQuestion?.[index]?.value === "a") ? "lightBlue.800" : isHovered ? "lightBlue.700" : "lightBlue.600"}
                                                                                                mr={2} mt={4}
                                                                                                pr={[0, 100]}
                                                                                                rounded="md" py={2}
                                                                                                style={{
                                                                                                    transform: [
                                                                                                        {
                                                                                                            scale: isPressed ? 0.96 : 1,
                                                                                                        },
                                                                                                    ],
                                                                                                }}>
                                                                                                <Flex flexDirection="row" alignItems="center">
                                                                                                    <Icon pl={2} as={MaterialCommunityIcons} color="purple.800" name="alpha-a-circle-outline" size="sm" />
                                                                                                    <Text pl={4} bold color="white">
                                                                                                        {question.a}
                                                                                                    </Text>
                                                                                                </Flex>
                                                                                            </Box>
                                                                                        )
                                                                                    }}
                                                                                </Pressable>
                                                                            </Box>
                                                                        </Flex>
                                                                    )}
                                                                    {question.b && (
                                                                        <Flex w="50%"
                                                                            mb={4}>
                                                                            <Box
                                                                                w="100%"
                                                                                justifyContent="center">
                                                                                <Pressable
                                                                                    onPress={() => checkQuestion('b', index)}>
                                                                                    {({ isHovered, isPressed }) => {
                                                                                        return (
                                                                                            <Box w="100%"
                                                                                                backgroundColor={(answeredQuestion?.[index]?.value === "b") ? "lightBlue.800" : isHovered ? "lightBlue.700" : "lightBlue.600"}
                                                                                                mr={2} mt={4}
                                                                                                pr={[0, 100]}
                                                                                                rounded="md" py={2}
                                                                                                style={{
                                                                                                    transform: [
                                                                                                        {
                                                                                                            scale: isPressed ? 0.96 : 1,
                                                                                                        },
                                                                                                    ],
                                                                                                }}>
                                                                                                <Flex flexDirection="row" alignItems="center">
                                                                                                    <Icon pl={2} as={MaterialCommunityIcons} color="purple.800" name="alpha-b-circle" size="sm" />
                                                                                                    <Text pl={4} bold color="white">
                                                                                                        {question.b}
                                                                                                    </Text>
                                                                                                </Flex>
                                                                                            </Box>
                                                                                        )
                                                                                    }}
                                                                                </Pressable>
                                                                            </Box>
                                                                        </Flex>
                                                                    )}
                                                                    {question.c && (
                                                                        <Flex w="50%"
                                                                            mb={4}
                                                                            pr={[2, 4]}>
                                                                            <Box
                                                                                w="100%"
                                                                                justifyContent="center">

                                                                                <Pressable
                                                                                    onPress={() => checkQuestion('c', index)}>
                                                                                    {({ isHovered, isPressed }) => {
                                                                                        return (
                                                                                            <Box w="100%"
                                                                                                backgroundColor={(answeredQuestion?.[index]?.value === "c") ? "lightBlue.800" : isHovered ? "lightBlue.700" : "lightBlue.600"}
                                                                                                mr={2} mt={4}
                                                                                                pr={[0, 100]}
                                                                                                rounded="md" py={2}
                                                                                                style={{
                                                                                                    transform: [
                                                                                                        {
                                                                                                            scale: isPressed ? 0.96 : 1,
                                                                                                        },
                                                                                                    ],
                                                                                                }}>
                                                                                                <Flex flexDirection="row" alignItems="center">
                                                                                                    <Icon pl={2} as={MaterialCommunityIcons} color="purple.800" name="alpha-c-circle-outline" size="sm" />
                                                                                                    <Text pl={4} bold color="white">
                                                                                                        {question.c}
                                                                                                    </Text>
                                                                                                </Flex>
                                                                                            </Box>
                                                                                        )
                                                                                    }}
                                                                                </Pressable>
                                                                            </Box>
                                                                        </Flex>
                                                                    )}
                                                                    {question.d && (
                                                                        <Flex w="50%"
                                                                            mb={4}>
                                                                            <Box
                                                                                w="100%"
                                                                                justifyContent="center">

                                                                                <Pressable
                                                                                    onPress={() => checkQuestion('d', index)}>
                                                                                    {({ isHovered, isPressed }) => {
                                                                                        return (
                                                                                            <Box w="100%"
                                                                                                backgroundColor={(answeredQuestion?.[index]?.value === "d") ? "lightBlue.800" : isHovered ? "lightBlue.700" : "lightBlue.600"}
                                                                                                mr={2} mt={4}
                                                                                                pr={[0, 100]}
                                                                                                rounded="md" py={2}
                                                                                                style={{
                                                                                                    transform: [
                                                                                                        {
                                                                                                            scale: isPressed ? 0.96 : 1,
                                                                                                        },
                                                                                                    ],
                                                                                                }}>
                                                                                                <Flex flexDirection="row" alignItems="center">
                                                                                                    <Icon pl={2} as={MaterialCommunityIcons} color="purple.800" name="alpha-d-circle" size="sm" />
                                                                                                    <Text pl={4} bold color="white">
                                                                                                        {question.d}
                                                                                                    </Text>
                                                                                                </Flex>
                                                                                            </Box>
                                                                                        )
                                                                                    }}
                                                                                </Pressable>
                                                                            </Box>
                                                                        </Flex>
                                                                    )}
                                                                </Flex>
                                                                <Button mt={8} variant="default" style={{ alignSelf: 'center' }} onPress={() => nextQuestion()} isDisabled={answeredQuestion[index] === undefined}>
                                                                    {currentIndex >= room?.questions.length - 1 ? i18next.t("room.finishButton") : i18next.t("room.nextButton")}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Box>

                                                ))
                                            )}
                                            <Button mt={20} style={{ alignSelf: 'center' }} onPress={goBack}>{i18next.t("room.backDashboard")}</Button>
                                            <Button mt={4} style={{ alignSelf: 'center' }} colorScheme="primary" onPress={() => copyCLipboard()}>{i18next.t("room.copyPIN")}</Button>
                                        </Box>
                                    </>
                                ) : (
                                    //-------------------------------------------RESULTS-------------------------------------------
                                    <>
                                        <Text bold fontSize={24}>{i18next.t("room.resultsTitle")}</Text>
                                        <Text>Correct answers: {answeredQuestion.filter(it => it.isCorrect === true).length} of {room.questions.length}</Text>
                                        <Text>Percentage: {(answeredQuestion.filter(it => it.isCorrect === true).length / room.questions.length) * 100}%</Text>
                                        {room.questions.map((question, index) => {
                                            return (
                                                <Box key={index} mt={5}>
                                                    <Text> {question.name}</Text>
                                                    {answeredQuestion && answeredQuestion[index].isCorrect === true ? (
                                                        <Alert status='success' mt={4}>
                                                            <VStack space={2} flexShrink={1} w="100%">
                                                                <HStack flexShrink={1} space={2} justifyContent="space-between">
                                                                    <HStack space={2} flexShrink={1}>
                                                                        <Alert.Icon mt="1" />
                                                                        <Text fontSize="md" color="coolGray.800">
                                                                            {i18next.t("room.correctAnswer")}
                                                                        </Text>
                                                                    </HStack>

                                                                </HStack>
                                                            </VStack>
                                                        </Alert>
                                                    ) : answeredQuestion && answeredQuestion[index].isCorrect === false && (
                                                        <Alert status='error' mt={4}>
                                                            <VStack space={2} flexShrink={1} w="100%">
                                                                <HStack flexShrink={1} space={2} justifyContent="space-between">
                                                                    <HStack space={2} flexShrink={1}>
                                                                        <Alert.Icon mt="1" />
                                                                        <Text fontSize="md" color="coolGray.800">
                                                                            {i18next.t("room.wrongAnswer")}
                                                                        </Text>
                                                                    </HStack>
                                                                </HStack>
                                                            </VStack>
                                                        </Alert>
                                                    )}
                                                </Box>
                                            )
                                        })}
                                        <Button colorScheme="secondary" mt={20} style={{ alignSelf: 'center' }} onPress={restart}>{i18next.t("room.restartButton")}</Button>
                                        <Button mt={6} style={{ alignSelf: 'center' }} onPress={goBack}>{i18next.t("room.backDashboard")}</Button>
                                    </>
                                )}
                            </>
                        ) :
                            (<Text>Quiz disabled!</Text>)}
                    </>
                ) :
                    roomExists === false ? (
                        <>
                            <Text fontSize={22}>This quiz doesn't exist =(</Text>
                            <Button mt={4} onPress={goBack}>{i18next.t("room.backDashboard")}</Button>
                        </>) :
                        <Spinner size="lg" />
                }
            </ScrollView>
        </>
    );
}