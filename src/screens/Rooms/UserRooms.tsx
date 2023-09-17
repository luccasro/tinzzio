import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Box, Button, Text, ScrollView, Avatar, SimpleGrid, Input, ScaleFade, Spinner, Heading } from "native-base";
import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { UserData } from "models";
import { checkIfLoggedIn, db, getUserData } from "services";
import { CardItem } from "../shared";
import { getMediaQuery } from "../../styles";

export const UserRooms = ({ navigation }: NativeStackHeaderProps) => {
    const isFocused = useIsFocused();

    useEffect(() => {
        setUser(undefined)
        checkIfLoggedIn({ navigation } as NativeStackHeaderProps,
            (user) =>
                getUserData(user.uid).then(user => { setUser(user); })
        )

    }, [isFocused]);


    const [user, setUser] = useState<UserData | undefined>(undefined);
    const isSmallMedium = getMediaQuery("isSmallMedium");


    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 100, width: "100%"
            }}>
            {user ?(
                <ScaleFade in={user !== undefined}>
                    <Box>
                    <Heading mb={3}>Library</Heading>
                        {user.rooms && user.rooms.length > 0? (
                            <SimpleGrid columns={isSmallMedium ? 1 : 3} spacingX={10} spacingY={5} alignItems="center" mx={[10, 0]}>
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