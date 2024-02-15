import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from 'models';

const linking: LinkingOptions<RootStackParamList> = {
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
          roomId: (roomId) => roomId.replace(/^room-/, ''),
        },
      },
      Users: {
        path: 'users/:username',
        parse: {
          userName: (username) => `${username}`,
        },
      },
      Settings: 'settings',
      UserRooms: 'library',
      Explore: 'explore',
      Reports: 'reports',
      Admin: 'admin',
      Word: 'word',
      Modal: 'modal',
      NotFound: '*',
    },
  },
};

export const hiddenPages = ['Details', 'Home'];

export default linking;
