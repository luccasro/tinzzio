import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import {
  Badge,
  Box,
  Divider,
  Flex,
  Icon,
  IconButton,
  Menu,
  Text,
  useColorMode,
  useColorModeValue,
  useTheme,
} from 'native-base';
import React from 'react';
import { db, logout } from 'services';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { Trans } from 'react-i18next';
import i18next from 'i18next';
import { useAuth } from 'context/useAuth';

export const MenuOptions = ({ navigation }: NativeStackHeaderProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const { user } = useAuth();

  const LanguageMenu: React.FC = () => {
    const changeLanguage = async (lng: string) => {
      await i18next.changeLanguage(lng).then(() => {
        AsyncStorage.setItem('language', lng).then(() =>
          navigation.navigate('Home'),
        );
      });
    };

    return (
      <>
        <Menu
          style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          trigger={(triggerProps) => {
            return (
              <IconButton
                {...triggerProps}
                mr={4}
                icon={<Icon as={FontAwesome5} name="globe-americas" />}
                borderRadius="full"
                _icon={{
                  color: useColorModeValue(theme.colors.coolGray[600], 'white'),
                  size: 'sm',
                }}
                _hover={{
                  bg: 'coolGray.600:alpha.20',
                }}
                _pressed={{
                  bg: 'coolGray.600:alpha.30',
                }}
              />
            );
          }}
        >
          <Menu.Item pr={20} onPress={() => changeLanguage('en')}>
            <Text bold>English </Text>
          </Menu.Item>
          <Menu.Item pr={20} onPress={() => changeLanguage('ptBR')}>
            <Text bold>Portuguese</Text>
          </Menu.Item>
        </Menu>
      </>
    );
  };

  const NotificationsMenu: React.FC = () => {
    const readAllNotifications = async () => {
      if (user && user.notifications && user.notifications.length > 0) {
        if (user.notifications.filter((it) => it.read === false).length > 0) {
          const tempNotifications = [...user.notifications];
          const indexes: number[] = [];
          const ref = doc(db, 'users', user.id);

          user.notifications.forEach((it, index) => {
            if (it.read === false) {
              indexes.push(index);
            }
          });

          indexes.map((val) => (tempNotifications[val].read = true));

          await updateDoc(ref, {
            notifications: tempNotifications,
          });
        }
      }
    };

    const removeNotification = async (index: number) => {
      if (user && user.notifications && user.notifications.length > 0) {
        const tempNotifications = [...user.notifications];

        const ref = doc(db, 'users', user.id);
        tempNotifications.splice(index, 1);

        await updateDoc(ref, {
          notifications: tempNotifications,
        });
      }
    };

    return (
      <>
        <Menu
          onClose={() => readAllNotifications()}
          style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          trigger={(triggerProps) => {
            return (
              <>
                <IconButton
                  {...triggerProps}
                  mr={4}
                  icon={
                    <>
                      {user &&
                        user.notifications &&
                        user.notifications.length > 0 &&
                        user.notifications.filter((it) => it.read === false)
                          .length > 0 && (
                          <Badge
                            colorScheme="danger"
                            rounded="full"
                            px={1}
                            py={0}
                            mb={-4}
                            mr={-2}
                            zIndex={1}
                            variant="solid"
                            alignSelf="flex-end"
                            _text={{
                              fontSize: 10,
                            }}
                          >
                            {
                              user.notifications.filter(
                                (it) => it.read === false,
                              ).length
                            }
                          </Badge>
                        )}
                      <Icon
                        as={MaterialCommunityIcons}
                        name="bell"
                        color={useColorModeValue(
                          theme.colors.coolGray[600],
                          'white',
                        )}
                        size="sm"
                      />
                    </>
                  }
                  borderRadius="full"
                  _hover={{
                    bg: 'coolGray.600:alpha.20',
                  }}
                  _pressed={{
                    bg: 'coolGray.600:alpha.30',
                  }}
                />
              </>
            );
          }}
        >
          {user && (
            <>
              {user.notifications && user.notifications.length > 0 ? (
                user.notifications.map((notification, index) => (
                  <Menu.Item py={5} pr={40} key={index}>
                    <Box>
                      <Flex
                        flexDirection="row"
                        width="100%"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        {notification.read === false && (
                          <Badge
                            mr={4}
                            colorScheme="info"
                            _text={{ fontWeight: 'bold' }}
                          >
                            NEW
                          </Badge>
                        )}
                        <Text bold>{notification.text}</Text>
                        {/* <Button onPress={() => removeNotification(index)}>Remover</Button> */}
                      </Flex>
                    </Box>
                  </Menu.Item>
                ))
              ) : (
                <Menu.Item pr={40}>
                  <Text bold>No notifications.</Text>
                </Menu.Item>
              )}
            </>
          )}
        </Menu>
      </>
    );
  };

  return (
    <>
      <Box flexDirection="row" style={{ alignItems: 'center' }}>
        <NotificationsMenu />
        <LanguageMenu />
        {/* -------------------------------------------------------------------------------------------- */}
        <Menu
          style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
          trigger={(triggerProps) => {
            return (
              <IconButton
                {...triggerProps}
                mr={4}
                icon={
                  <FontAwesome
                    selectable={false}
                    name="user-circle"
                    size={30}
                    color={theme.colors.purple[700]}
                  />
                }
                borderRadius="full"
                _hover={{
                  bg: 'purple.700:alpha.20',
                }}
                _pressed={{
                  bg: 'purple.700:alpha.30',
                }}
              />
            );
          }}
        >
          <Menu.Item
            pr={20}
            onPress={() => {
              navigation.navigate('Users', { username: user?.userName });
            }}
          >
            <Flex
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <MaterialIcons
                name="person"
                size={24}
                color={theme.colors.coolGray[500]}
              />
              <Flex>
                <Text bold pl={2}>
                  {t('navbarOptions.profile')}
                </Text>
              </Flex>
            </Flex>
          </Menu.Item>
          <Menu.Item pr={20} onPress={() => navigation.navigate('Settings')}>
            <Flex
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <MaterialIcons
                name="settings"
                size={24}
                color={theme.colors.coolGray[500]}
              />
              <Flex>
                <Text bold pl={2}>
                  {t('navbarOptions.settings')}
                </Text>
              </Flex>
            </Flex>
          </Menu.Item>
          <Menu.Item pr={20} onPress={toggleColorMode}>
            <Flex
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <MaterialCommunityIcons
                name={useColorModeValue(
                  'moon-waning-crescent',
                  'white-balance-sunny',
                )}
                size={24}
                color={theme.colors.coolGray[500]}
              />
              <Text pl={2} bold>
                <Trans i18nKey="navbarOptions.changeTheme" />
              </Text>
            </Flex>
          </Menu.Item>
          <Divider />
          <Menu.Item
            pr={20}
            onPress={() => logout({ navigation } as NativeStackHeaderProps)}
          >
            <Flex
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
            >
              <MaterialIcons
                name="logout"
                size={24}
                color={theme.colors.red[600]}
              />
              <Text bold pl={2} color="red.600">
                {t('navbarOptions.logout')}
              </Text>
            </Flex>
          </Menu.Item>
        </Menu>
      </Box>
    </>
  );
};
