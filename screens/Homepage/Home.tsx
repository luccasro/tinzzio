import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export const Home = ({ navigation }: NativeStackHeaderProps) => {
    return (
      <View style={style.container}>
        <Text style={style.title}>Home Screen</Text>
        <Button
          icon="camera" mode="contained"
          onPress={() => navigation.navigate('Details')}>eae</Button>
  
      </View>
    );
  }

  const style = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: "white"
    }
  });