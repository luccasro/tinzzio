import { NavigationProp, ParamListBase, useIsFocused, useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Box, Center, HStack, Spinner, useToast, Text } from "native-base";
import React, { useEffect, useState } from "react";
import {useRoute} from '@react-navigation/native';

export const Home = () => {
    const toast = useToast();
    const id = "toast-welcome"
    const [loadToast, setLoadToast] = useState(true);
    const isFocused = useIsFocused();
    const navigation: NavigationProp<ParamListBase> = useNavigation();
    const auth = getAuth();
    const route = useRoute();


    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                if (loadToast) {
                    showToast(user.displayName);
                    setLoadToast(false)
                }
                navigation.navigate('Dashboard');
            } else if(route.name !== "Word") {
                navigation.navigate('Login');
            }
        });
    },[isFocused]);

    const showToast = (name?: string | null) => {
        if (!toast.isActive(id)) {
            toast.show({
                id,
                render: () => {
                    return (
                        <Box bg="emerald.500" px="2" py="2" rounded="sm" mb={5}>
                            <Text fontSize={16} color="white">Logged as {name}!</Text>
                        </Box>
                    )
                },
            })
        }
    }
    return (
        <Center flex={1} px="3">
            <HStack space={2} alignItems="center">
                <Spinner size="lg" />
            </HStack>
        </Center>
    );
}