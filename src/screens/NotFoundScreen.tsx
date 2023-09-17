import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Button, ScrollView, Text } from 'native-base';
import React from 'react';

export default function NotFoundScreen({ navigation }: NativeStackHeaderProps) {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 80
      }}>
      <Text bold fontSize={[40, 100]}>404</Text>
      <Text bold fontSize={[20, 40]}>Page not found =(</Text>
      <Button variant="default" mt={10} onPress={() => navigation.navigate('Home')}>
        Back to Home!
      </Button>
    </ScrollView>
  );
}