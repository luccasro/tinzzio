/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '../../types';

const linking: LinkingOptions<RootStackParamList | any> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Home: '',
      Dashboard: 'dashboard',
      CreateRoom: 'create',
      Login: 'login',
      Room: {
        path: 'rooms/:roomId',
        parse: {
          roomId: (roomId) => `room-${roomId}`,
        },
        stringify: {
          roomId: (roomId) => roomId.replace(/^room-/, '')
        },
      },
      Users: {
        path: 'users/:userName',
        parse: {
          userName: (userName) => `${userName}`,
        }
      },
      Settings: 'settings',
      UserRooms: 'library',
      Explore: "explore",
      Reports: "reports",
      Admin: "admin",
      Word: "word",
      Modal: 'modal',
      NotFound: '*',
      Root: {
        screens: {
          TabOne: {
            screens: {
              TabOneScreen: 'one',
            },
          },
          TabTwo: {
            screens: {
              TabTwoScreen: 'two',
            },
          },
        },
      },
    },
  },
};

export const hiddenPages = [
  'Details',
  'Home'
];

export default linking;
