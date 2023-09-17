import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { Button } from "native-base";
import React from "react";
import { logout } from "services";

export const LogoutButton = ({ navigation }: NativeStackHeaderProps) => {

    return (
        <>
        <Button variant="unstyled" onPress={() => logout({navigation} as NativeStackHeaderProps)}>deslogar</Button>
        </>
    );
}