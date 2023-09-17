import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Box, Button, Text, ScrollView, Avatar, SimpleGrid, Input, ScaleFade, Spinner, Heading, useMediaQuery, View, Center } from "native-base";
import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { LoadRoom } from "../Rooms/LoadRoom";
import { checkIfLoggedIn, db, getUserData } from "services";
import { CardItem } from "../shared";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Trans } from "react-i18next";
import { RoomData, UserData } from "models";
import { getMediaQuery } from "../../styles";
import i18next from "i18next";
import Swiper from 'react-native-swiper'
import { StyleSheet } from 'react-native'

export const Dashboard = ({ navigation }: NativeStackHeaderProps) => {
    const isFocused = useIsFocused();
    const [user, setUser] = useState<UserData | undefined>(undefined);
    const [rooms, setRooms] = useState<RoomData[]>([]);
    const auth = getAuth();

    useEffect(() => {
        setRooms([])
        setUser(undefined)
        onAuthStateChanged(auth, (user) => {
            if (user) {
                getUserData(user.uid).then(user => { setUser(user) }).then(() => loadRoom())
            } else {
                navigation.navigate('Login')
            }
        });

    }, [isFocused, auth]);

    const loadRoom = async () => {
        const ref = collection(db, "rooms");
        const q = query(ref, where("privacy", "==", "public"), limit(10));
        const querySnapshot = await getDocs(q);
        const tempRoom: RoomData[] = []

        querySnapshot.forEach((doc) => {
            tempRoom.push(doc.data() as RoomData)
        });

        setRooms(tempRoom)
    }

    const isSmallMedium = getMediaQuery("isSmallMedium");

    // const styles = StyleSheet.create({
    //     wrapper: {},
    //     slide1: {
    //         flex: 1,
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         backgroundColor: '#9DD6EB'
    //     },
    //     slide2: {
    //         flex: 1,
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         backgroundColor: '#97CAE5'
    //     },
    //     slide3: {
    //         flex: 1,
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //         backgroundColor: '#151515'
    //     },
    // })


    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                // justifyContent: 'center',
                alignItems: isSmallMedium ? undefined : 'center'
                // justifyContent: 'center', alignItems: 'center', marginVertical: 80, marginHorizontal: 10
            }}>
            {user ? (
                <ScaleFade in={user !== undefined}>
                    <>
                        <LoadRoom />
                        <Box style={{ marginHorizontal: 10 }}>
                            {/* <Box mt={6} w={280} h={300} style={{ alignSelf: 'center' }}>
                                <Swiper
                                    showsButtons={true}
                                    loop={false}
                                    autoplay={true}
                                    autoplayTimeout={4}
                                    showsPagination={true}
                                >
                                    <View style={styles.slide1}>
                                        <Text bold color="white" fontSize={30}>Ei</Text>
                                    </View>
                                    <View style={styles.slide2}>
                                        <Text color="white" fontSize={30}>Oi</Text>
                                    </View>
                                    <View style={styles.slide3}>
                                        <Text color="white" fontSize={30}>Fala</Text>
                                    </View>
                                </Swiper>
                            </Box> */}
                            <Box>
                                <Button style={{ alignSelf: 'center' }} variant="default" mt={4} onPress={() => navigation.navigate('CreateRoom')}>{i18next.t("dashboard.createQuiz")}</Button>
                            </Box>
                            {rooms && rooms.length > 0 && (
                                <Box mt={10}>
                                    <Heading mb={10} alignSelf="center"><Trans i18nKey="dashboard.recommendations" /></Heading>
                                    <SimpleGrid columns={isSmallMedium ? 1 : 3} spacingX={10} spacingY={5} alignItems="center" mx={[10, 0]} mb={200}>
                                        {rooms.map((room, key) => {
                                            return (
                                                <Box key={key} minWidth="200px" mt={2}>
                                                    {/* <CardItem room={Object.values(room)[0]} ownerId={user.id} /> */}
                                                    <CardItem room={room} ownerId={user.id} />
                                                </Box>
                                            )
                                        })}
                                    </SimpleGrid>
                                </Box>
                            )}
                        </Box>
                    </>
                </ScaleFade>
            ) :
                (<Center width="100%" height="100%">
                    <Spinner size="lg" />
                    </Center>)}
        </ScrollView>
    );
}