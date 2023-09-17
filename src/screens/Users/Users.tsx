import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Box, Button, Text, ScrollView, Avatar, SimpleGrid, Input, Spinner, Center, Flex, ScaleFade, Heading } from "native-base";
import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { UserData } from "models";
import { checkIfLoggedIn, db, getUserData } from "services";
import { doc, getDoc } from "firebase/firestore";
import i18next from "i18next";
import { getMediaQuery } from "../../styles";
import { CardItem } from "../shared";

interface UserName {
    userName: string;
}

export const Users = ({ route, navigation }: NativeStackHeaderProps) => {
    const isFocused = useIsFocused();
    const [userLogged, setUserLogged] = useState<UserData | undefined>(undefined);
    const [user, setUser] = useState<UserData | undefined>(undefined);
    const [userExists, setUserExists] = useState<boolean | undefined>(undefined);

    const getUserNameData = async (userName: string) => {
        const docRef = doc(db, "usernames", userName)
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            getUserData(docSnap.data().id).then(user => setUser(user))
            setUserExists(true)
        }
        else {
            setUserExists(false)
        }
    }

    useEffect(() => {
        setUser(undefined);
        setUserLogged(undefined);
        setUserExists(undefined);
        if (route.params) {
            getUserNameData((route.params as UserName).userName)
            checkIfLoggedIn({ navigation } as NativeStackHeaderProps,
                (user) => getUserData(user.uid).then(user => { setUserLogged(user); }))
        }
        else {
            setUserExists(false)
        }
    }, [isFocused]);

    const isSmallMedium = getMediaQuery("isSmallMedium");


    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
               marginBottom: 80,
                alignItems: isSmallMedium ? undefined : 'center'
            }}>
                 <Box mb="150">
                <Box bg="blue.600" py={20} w={!isSmallMedium ? "100vw" : "100%"}
                    style={{ alignSelf: !isSmallMedium ? 'center' : 'center' }} />
                <Center
                    position="absolute"
                    alignSelf="center"
                    top="50%">
                    <Box rounded="lg"
                        p={6}
                        borderColor="coolGray.200"
                        borderWidth="1"
                        _dark={{
                            borderColor: "coolGray.600",
                            backgroundColor: "gray.700",
                        }}
                        _web={{
                            shadow: 2,
                            borderWidth: 0,
                            cursor: "default"
                        }}
                        _light={{
                            backgroundColor: "gray.50",
                        }}>
                        {user ? (
                            <Flex alignItems="center">
                                <Avatar
                                    size="xl"
                                    source={{
                                        uri: user.photoUrl ?? ''
                                    }}>
                                    {user && user.name ? user.name.match(/\b(\w)/g)?.join('') : ''}
                                </Avatar>
                                <Text bold mt={1}>{user.name}</Text>
                            </Flex>
                        ) : userExists === false ? (
                            <>
                    <Text>User don't exist.</Text>
                </>
            ) :
                <Spinner size="lg" />}
                    </Box>
                </Center>
            </Box>
            {user ?(
                <ScaleFade in={user !== undefined}>
                    <Box>
                    <Heading mb={3}>User quiz</Heading>
                        {user.rooms && user.rooms.length > 0? (
                            <SimpleGrid columns={isSmallMedium ? 1 : 3} spacingX={10} spacingY={5} alignItems="center" mx={[10, 0]}  mb={20}>
                                {user.rooms.map((room, key) => {
                                    return (
                                        <Box key={key} minWidth="200px" mt={2}>
                                            <CardItem room={Object.values(room)[0]} ownerId={user.id} />
                                        </Box>
                                    )
                                })}
                            </SimpleGrid>
                        ):
                        (<Text>User don't have quiz.</Text>) }
                    </Box>

                </ScaleFade>
                ):
            (<Spinner size="lg" />)}           
        </ScrollView>
    );
}