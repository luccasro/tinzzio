import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Box, Button, Text, ScrollView, Avatar, Input, Spinner, Heading } from "native-base";
import React, { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { UserData } from "models";
import { checkIfLoggedIn, db, getUserData } from "services";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const Settings = ({ navigation }: NativeStackHeaderProps) => {
    const isFocused = useIsFocused();
    const [user, setUser] = useState<UserData | undefined>(undefined);
    const [userName, setUserName] = useState('');

    const [userNameAvailable, setUserNameAvailable] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        setUser(undefined)
        checkIfLoggedIn({ navigation } as NativeStackHeaderProps,
            (user) =>
                getUserData(user.uid).then(user => { setUser(user); })
        )

    }, [isFocused]);

    useEffect(() => {
        if (userName.length > 0) {
            checkUserName()
        }
        else {
            setUserNameAvailable(undefined)
        }
    }, [userName]);



    const checkUserName = async () => {
        if (user) {
            setUserNameAvailable(undefined)
            const username = userName.toLowerCase();
            const docRef = doc(db, "usernames", username);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserNameAvailable(false)
            }
            else {
                setUserNameAvailable(true)
            }
        }
    }

    const updateUserName = async () => {
        if (user) {
            const refUsers = doc(db, "users", user.id);
            const oldUserName = user.userName;

            await updateDoc(refUsers, {
                userName: userName
            })
                .then(async () =>
                    await deleteDoc(doc(db, "usernames", oldUserName)).then(async () =>
                        await setDoc(doc(db, "usernames", userName), { id: user.id })).then(() => navigation.navigate('Home')));
        }
    }


    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center', alignItems: 'center', marginVertical: 10
            }}>
            {user ? (
                <>
                    <Heading mb={8}>Settings</Heading>
                    <Text bold mt={1}>Current username: {user.userName}</Text>
                    <Input minWidth="250px" mt={4} value={userName} onChangeText={setUserName} />
                    {userName.length > 2 && (
                        <Text bold>{userNameAvailable === true ? `${userName} is available` : userNameAvailable === false ? `${userName} is not available` : '...'}</Text>
                    )}
                    <Button mt={4} isDisabled={userName.length <= 2 || !userNameAvailable} onPress={() => updateUserName()}>Change username</Button>
                    <Button mt={4} style={{ alignSelf: 'center' }} onPress={() => navigation.navigate('Users', { userName: user.userName })}>View profile</Button>
                </>
            ) :
                <Spinner size="lg" />}
        </ScrollView>
    );
}