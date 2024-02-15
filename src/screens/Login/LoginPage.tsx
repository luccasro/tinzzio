import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  useTheme,
  useColorMode,
  Spinner,
  Flex,
  Stack,
  ScrollView,
  KeyboardAvoidingView,
  Divider,
} from 'native-base';
import * as Google from 'expo-google-app-auth';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  OAuthCredential,
} from 'firebase/auth';
import { Platform } from 'react-native';
import { generateUserDocument } from 'services';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import { auth } from '../../../config';
import { AntDesign } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

type Result = {
  type: string;
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
  user: Google.GoogleUser;
};

export const LoginPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const navigation: NavigationProp<ParamListBase> = useNavigation();

  const { toggleColorMode } = useColorMode();
  const [loadLogin, setLoadLogin] = useState(false);

  const config = {
    androidClientId: `1083228948497-a9323e3fj1tefr7cmlpsc3t7914j507s.apps.googleusercontent.com`,
    androidStandaloneAppClientId:
      '1083228948497-0asmrr9n5uofrlp8sv370p2qbkt918r0.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.navigate('Home');
      }
    });
  }, []);

  const onSignIn = (googleUser: Result | OAuthCredential) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe();
      const credential = GoogleAuthProvider.credential(
        googleUser.idToken,
        googleUser.accessToken,
      );

      signInWithCredential(auth, credential)
        .then((result) => {
          if (result.user) {
            generateUserDocument(
              { navigation } as NativeStackHeaderProps,
              result.user,
            ).then(() => setLoadLogin(false));
          }
        })
        .catch(function (error) {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
          setLoadLogin(false);
        });
    });
  };

  const handleGoogleSignIn = async () => {
    setLoadLogin(true);
    if (Platform.OS === 'android') {
      Google.logInAsync(config)
        .then((result) => {
          if (result.type === 'success') {
            onSignIn(result);
            return result.accessToken;
          }
        })
        .catch((error) => {
          console.log(error);
          setLoadLogin(false);
        });
    } else {
      loginWeb();
    }
  };

  const loginWeb = () => {
    const googleProvider = new GoogleAuthProvider();
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          onSignIn(credential);
        }
      })
      .catch((error) => {
        console.log(error);
        setLoadLogin(false);
      });
  };

  return (
    <ScrollView
      _contentContainerStyle={{
        height: '100%',
        _light: { bg: theme.colors.white },
        _dark: { bg: theme.colors.black },
      }}
    >
      <KeyboardAvoidingView h="100%">
        <Stack direction={['column', 'row']} h="100%">
          <Flex
            w={['100%', '50%']}
            h={['40%', '100%']}
            bg="purple.500"
            alignItems="center"
            justifyContent="center"
          >
            <Heading color="white" size="lg">
              Tinzzio
            </Heading>
          </Flex>
          <Flex
            w={['100%', '50%']}
            h={['60%', '100%']}
            _light={{ bg: '#FFFFFF' }}
            _dark={{ bg: theme.colors.black }}
            alignItems="center"
            justifyContent="center"
          >
            {loadLogin && (
              <Box pb={4}>
                <Spinner size="lg" />
              </Box>
            )}
            <Box>
              <Button
                variant="default"
                size="lg"
                w="300px"
                leftIcon={<AntDesign name="google" size={24} color="white" />}
                onPress={handleGoogleSignIn}
              >
                {t('login.loginGoogle')}
              </Button>
              <Divider my={4} />
              <Button
                variant="outline"
                colorScheme="purple"
                onPress={toggleColorMode}
                isDisabled
              >
                {t('login.createAccount')}
              </Button>
            </Box>
          </Flex>
        </Stack>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};
