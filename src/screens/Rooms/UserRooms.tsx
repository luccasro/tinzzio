import {
  Box,
  Text,
  ScrollView,
  SimpleGrid,
  ScaleFade,
  Spinner,
  Heading,
  Center,
} from 'native-base';
import React from 'react';
import { CardItem } from '../shared/CardItem';
import { getMediaQuery } from '../../styles';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'context/useAuth';

export const UserRooms = () => {
  const { t } = useTranslation();
  const { user, isLoading, refreshData } = useAuth();
  const isSmallMedium = getMediaQuery('isSmallMedium');

  if (!user || isLoading) {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: isSmallMedium ? undefined : 'center',
        }}
      >
        <Center width="100%" height="100%">
          <Spinner size="lg" />
        </Center>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 100,
        width: '100%',
      }}
    >
      <ScaleFade in={!!user}>
        <Box>
          <Heading mb={3}>Library</Heading>
          {user.rooms && user.rooms.length ? (
            <SimpleGrid
              columns={isSmallMedium ? 1 : 3}
              spacingX={10}
              spacingY={5}
              alignItems="center"
              mx={[10, 0]}
            >
              {user.rooms.map((room, key) => {
                return (
                  <Box key={key} minWidth="200px" mt={2}>
                    <CardItem
                      onDisable={refreshData}
                      onRemove={refreshData}
                      room={Object.values(room)[0]}
                      ownerId={user.id}
                    />
                  </Box>
                );
              })}
            </SimpleGrid>
          ) : (
            <Text>
              <Text>{t('shared.userWithoutQuiz')}</Text>
            </Text>
          )}
        </Box>
      </ScaleFade>
    </ScrollView>
  );
};
