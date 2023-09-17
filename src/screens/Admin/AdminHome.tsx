import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Box, Button, Text, ScrollView } from "native-base";
import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { getUserData } from "services";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Trans } from "react-i18next";
import { UserData } from "models";
import { getMediaQuery } from "../../styles";
import i18next from "i18next";
import { CategoryAdmin } from "./Category";

export const AdminHome = ({ navigation }: NativeStackHeaderProps) => {
    const isFocused = useIsFocused();
    const [user, setUser] = useState<UserData | undefined>(undefined);
    const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
    const auth = getAuth();

    useEffect(() => {
        setUser(undefined)
        setIsAdmin(undefined)
        onAuthStateChanged(auth, (user) => {
            if (user) {
                getUserData(user.uid).then(user => { setUser(user) })
            } else {
                navigation.navigate('Login')
            }
        });

    }, [isFocused, auth]);

    useEffect(() => {
        if (user) {
            if (user?.admin === true) {
                setIsAdmin(true)
            }
            else {
                navigation.navigate('Home')
            }
        }
    }, [user]);

    const isSmallMedium = getMediaQuery("isSmallMedium");


    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: isSmallMedium ? undefined : 'center'
            }}>
            {user && isAdmin && (
                <>
                    <Text>Oi adm</Text>
                    <Box alignSelf="center">
                        <CategoryAdmin />
                    </Box>
                </>
            )}
        </ScrollView>
    );
}