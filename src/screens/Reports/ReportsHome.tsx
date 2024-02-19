import { Box, Text, ScrollView, ScaleFade, Spinner, Center } from 'native-base';
import React from 'react';
import { getMediaQuery } from '../../styles';
import { useAuth } from 'context/useAuth';
import { useTranslation } from 'react-i18next';

export const ReportsHome = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
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
        marginVertical: 80,
      }}
    >
      {user ? (
        <ScaleFade in={user !== undefined}>
          <Box>
            <Text bold fontSize={30}>
              {t('shared.userWithoutQuiz')}
            </Text>
          </Box>
        </ScaleFade>
      ) : (
        <Spinner size="lg" />
      )}
    </ScrollView>
  );
};
