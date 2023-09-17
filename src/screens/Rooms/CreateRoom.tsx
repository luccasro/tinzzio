import { useIsFocused, useNavigation } from "@react-navigation/native";
import { child, getDatabase, push, ref, set } from "firebase/database";
import { Box, Button, Divider, Flex, Icon, IconButton, Input, Modal, Radio, ScrollView, Text, Tooltip, useTheme } from "native-base";
import React, { useEffect, useState } from "react";
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { RoomData } from "models";
import { Entypo, AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { checkIfLoggedIn, db, getUserData } from "services";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { addDoc, arrayUnion, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import i18next from "i18next";

export const CreateRoom: React.FC = () => {
    const [roomName, setRoomName] = useState('');
    const [questions, setQuestions] = useState([{
        name: '',
        a: '',
        b: '',
        c: '',
        d: '',
        correctOption: ''
    }])
    const [roomPrivacy, setRoomPrivacy] = useState<"public" | "private" | "link">("public");
    const disabled = questions.map(question => (question.name === '' || !question.a || !question.b || !question.c || !question.d || !question.correctOption))

    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const [user, setUser] = useState<{ id: string | undefined, userName: string | undefined,  name: string | null | undefined }>({
        id: undefined,
        userName: undefined,
        name: undefined
    });
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const theme = useTheme();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            setQuestions([{
                name: '',
                a: '',
                b: '',
                c: '',
                d: '',
                correctOption: ''
            }]);
            setUser({
                id: undefined,
                userName: undefined,
                name: undefined
            });
            setRoomName('');
            checkIfLoggedIn({ navigation } as NativeStackHeaderProps,
                (user) => getUserData(user.uid).then(user2 => setUser({
                    id: user.uid,
                    userName: user2.userName,
                    name: user.displayName
                })))
        }
    }, [isFocused]);

    const createRoom = async () => {
        // const roomId = push(child(ref(db), path)).key;

        if (user.id && user.name !== undefined) {
            const docRef = await addDoc(collection(db, "rooms"), {});

            const room: RoomData = {
                id: docRef.id,
                name: roomName,
                owner: {
                    id: user.id,
                    userName: user.userName as string,
                    name: user.name
                },
                created_at: new Date().toLocaleString(),
                disabled: false,
                privacy: roomPrivacy,
                questions: questions
            }
            await setDoc(doc(db, "rooms", docRef.id), room);

            await updateDoc(doc(db, `users`, user.id), { rooms: arrayUnion({ [docRef.id]: room }) })
                .then(() => { navigation.navigate('Room', { roomId: docRef.id }); })

        }
    };

    const onChangeInput = (newValue: string, input: 'name' | 'a' | 'b' | 'c' | 'd' | 'correctOption', index: number) => {
        let values = [...questions];
        values[index] = {
            name: input === 'name' ? newValue : values[index].name,
            a: input === 'a' ? newValue : values[index].a,
            b: input === 'b' ? newValue : values[index].b,
            c: input === 'c' ? newValue : values[index].c,
            d: input === 'd' ? newValue : values[index].d,
            correctOption: input === 'correctOption' ? newValue : values[index].correctOption
        }
        setQuestions(values)
    }

    const addQuestion = () => {
        let newQuestion = {
            name: '',
            a: '',
            b: '',
            c: '',
            d: '',
            correctOption: ''
        }
        setQuestions(oldQuestions => [...oldQuestions, newQuestion])
    }

    const removeQuestion = (index: number) => {
        let values = [...questions];
        values.splice(index, 1)
        setQuestions(values)
    }

    return (
        <>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 10
                }}>
                {user.id && (
                    <>
                        <Box px={[4, 0]} w={["100%", ""]}>
                            <Text bold fontSize={24} mt={5}>Quiz name:</Text>
                            <Input mt={5} size="lg" value={roomName} onChangeText={setRoomName} />
                            <Flex flexDirection="row" justifyContent="flex-end">
                                <Button my={5} variant="default" style={{ alignSelf: 'center' }} leftIcon={<Icon as={MaterialCommunityIcons} name="cogs" size="sm" />}
                                    onPress={() => setShowSettings(true)}>Settings
                                </Button>
                            </Flex>
                            {questions.map((question, index) => (
                                <Box key={index}>
                                    {index > 0 && (
                                        <Flex flexDirection="row" justifyContent="flex-end">
                                            <Button mt={5} style={{ alignSelf: 'center' }} leftIcon={<Icon as={Ionicons} name="remove" size="sm" />} colorScheme="danger" onPress={() => removeQuestion(index)}>{"Remove question " + (index + 1)}</Button>
                                        </Flex>
                                    )}
                                    <Text bold fontSize={24} mt={2}>Question {(index + 1).toString()}:</Text>
                                    <Input mt={5} size="lg" value={questions[index].name} onChangeText={(text: string) => onChangeInput(text, 'name', index)} />
                                    <Flex flexDirection={["row", "row"]} justifyContent="center" flexWrap="wrap" mt={5}>
                                        <Flex w="50%"
                                            mb={4}
                                            pr={4}>
                                            <Box bg="white"
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
                                                }}>
                                                <Flex px={4} w="100%" flexDirection="row" justifyContent="center" alignItems="center">
                                                    <Flex w="100%" >
                                                        <Input variant="unstyled" size="lg" value={questions[index].a} placeholder="Option A" onChangeText={(text: string) => onChangeInput(text, 'a', index)} />
                                                    </Flex>
                                                    <Flex>
                                                        <IconButton
                                                            onPress={() => onChangeInput("a", 'correctOption', index)}
                                                            icon={<Icon as={AntDesign} name="checkcircle" />}
                                                            borderRadius="full"
                                                            _icon={{
                                                                color: question.correctOption === "a" ? "green.600" : "coolGray.700",
                                                                size: "sm",
                                                            }}
                                                            _hover={{
                                                                bg: "green.600:alpha.20",
                                                                color: "blue.600",
                                                            }}
                                                            _pressed={{
                                                                bg: "green.600:alpha.20",
                                                                color: "blue.800",
                                                            }}
                                                        />
                                                    </Flex>
                                                </Flex>
                                            </Box>
                                        </Flex>
                                        <Flex w="50%"
                                            mb={4}>
                                            <Box bg="white"
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
                                                }}>
                                                <Flex px={4} w="100%" flexDirection="row" justifyContent="center" alignItems="center">
                                                    <Flex w="100%" >
                                                        <Input variant="unstyled" size="lg" value={questions[index].b} placeholder="Option B" onChangeText={(text: string) => onChangeInput(text, 'b', index)} />
                                                    </Flex>
                                                    <Flex>
                                                        <IconButton
                                                            onPress={() => onChangeInput("b", 'correctOption', index)}
                                                            icon={<Icon as={AntDesign} name="checkcircle" />}
                                                            borderRadius="full"
                                                            _icon={{
                                                                color: questions[index].correctOption === "b" ? "green.600" : "coolGray.700",
                                                                size: "sm",
                                                            }}
                                                            _hover={{
                                                                bg: "green.600:alpha.20",
                                                                color: "blue.600",
                                                            }}
                                                            _pressed={{
                                                                bg: "green.600:alpha.20",
                                                                color: "blue.800",
                                                            }}
                                                        />
                                                    </Flex>
                                                </Flex>
                                            </Box>
                                        </Flex>
                                        <Flex w="50%"
                                            pr={4}>
                                            <Box bg="white"
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
                                                }}>
                                                <Flex px={4} w="100%" flexDirection="row" justifyContent="center" alignItems="center">
                                                    <Flex w="100%" >
                                                        <Input variant="unstyled" size="lg" value={questions[index].c} placeholder="Option C" onChangeText={(text: string) => onChangeInput(text, 'c', index)} />
                                                    </Flex>
                                                    <Flex>
                                                        <IconButton
                                                            onPress={() => onChangeInput("c", 'correctOption', index)}
                                                            icon={<Icon as={AntDesign} name="checkcircle" />}
                                                            borderRadius="full"
                                                            _icon={{
                                                                color: questions[index].correctOption === "c" ? "green.600" : "coolGray.700",
                                                                size: "sm",
                                                            }}
                                                            _hover={{
                                                                bg: "green.600:alpha.20",
                                                                color: "blue.600",
                                                            }}
                                                            _pressed={{
                                                                bg: "green.600:alpha.20",
                                                                color: "blue.800",
                                                            }}
                                                        />
                                                    </Flex>
                                                </Flex>
                                            </Box>
                                        </Flex>
                                        <Flex w="50%">
                                            <Box bg="white"
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
                                                }}>
                                                <Flex px={4} w="100%" flexDirection="row" justifyContent="center" alignItems="center">
                                                    <Flex w="100%" >
                                                        <Input variant="unstyled" size="lg" value={questions[index].d} placeholder="Option D" onChangeText={(text: string) => onChangeInput(text, 'd', index)} />
                                                    </Flex>
                                                    <Flex>
                                                        <IconButton
                                                            onPress={() => onChangeInput("d", 'correctOption', index)}
                                                            icon={<Icon as={AntDesign} name="checkcircle" />}
                                                            borderRadius="full"
                                                            _icon={{
                                                                color: questions[index].correctOption === "d" ? "green.600" : "coolGray.700",
                                                                size: "sm",
                                                            }}
                                                            _hover={{
                                                                bg: "green.600:alpha.20",
                                                                color: "blue.600",
                                                            }}
                                                            _pressed={{
                                                                bg: "green.600:alpha.20",
                                                                color: "blue.800",
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
                        <Button leftIcon={<Icon as={Ionicons} name="add-circle-outline" size="sm" />} onPress={addQuestion} mt={5}>Add question</Button>
                        <Button isDisabled={disabled.some(it => it === true)} onPress={createRoom} mt={5}>Finish and create quiz!</Button>
                        <Button mt={4} variant="outline" onPress={() => navigation.navigate('Dashboard')}>{i18next.t("room.backDashboard")}</Button>

                        <Modal
                            isOpen={showSettings}
                            onClose={() => setShowSettings(false)}
                            size="xl">
                            <Modal.Content>
                                <Modal.CloseButton />
                                <Modal.Header><Text variant="modalHeader">Settings</Text></Modal.Header>
                                <Modal.Body my={10}>
                                    <Flex flexDirection="row">
                                        <Flex flexDirection="row" alignItems="center">
                                            <Text bold fontSize={[14, 18]}>Privacy

                                            </Text>
                                            <Box>
                                                <Tooltip label="Public| Private | Link only">
                                                    <IconButton
                                                        ml={1}
                                                        p={0}
                                                        icon={<Icon as={MaterialCommunityIcons} name="help-circle-outline" />}
                                                        _icon={{
                                                            color: "coolGray.700",
                                                            size: "20px",
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
                                                onPress={() => setRoomPrivacy("public")}
                                                borderRadius="full"
                                                bg={roomPrivacy === "public" ? "green.600:alpha.20" : undefined}
                                                _icon={{
                                                    color: roomPrivacy === "public" ? "green.600" : "coolGray.700",
                                                    size: "md",
                                                }}
                                                _hover={{
                                                    bg: "green.600:alpha.20",
                                                }}
                                                _pressed={{
                                                    bg: "green.600:alpha.20",
                                                }}

                                            />
                                            <IconButton
                                                mr={4}
                                                icon={<Icon as={MaterialCommunityIcons} name="lock" />}
                                                onPress={() => setRoomPrivacy("private")}
                                                borderRadius="full"
                                                bg={roomPrivacy === "private" ? "green.600:alpha.20" : undefined}
                                                _icon={{
                                                    color: roomPrivacy === "private" ? "green.600" : "coolGray.700",
                                                    size: "md",
                                                }}
                                                _hover={{
                                                    bg: "green.600:alpha.20",
                                                }}
                                                _pressed={{
                                                    bg: "green.600:alpha.20",
                                                }}

                                            />
                                            <IconButton
                                                mr={4}
                                                icon={<Icon as={MaterialCommunityIcons} name="link-lock" />}
                                                onPress={() => setRoomPrivacy("link")}
                                                borderRadius="full"
                                                bg={roomPrivacy === "link" ? "green.600:alpha.20" : undefined}
                                                _icon={{
                                                    color: roomPrivacy === "link" ? "green.600" : "coolGray.700",
                                                    size: "md",
                                                }}
                                                _hover={{
                                                    bg: "green.600:alpha.20",
                                                }}
                                                _pressed={{
                                                    bg: "green.600:alpha.20",
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
                                                setShowSettings(false)
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onPress={() => {
                                                setShowSettings(false)
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </Button.Group>
                                </Modal.Footer>
                            </Modal.Content>
                        </Modal>
                    </>
                )}
            </ScrollView>
        </>
    );
}