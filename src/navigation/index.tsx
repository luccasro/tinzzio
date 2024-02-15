import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useRoute,
  useNavigation,
  ParamListBase,
  NavigationProp,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
} from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, TouchableOpacity } from 'react-native';
import LinkingConfiguration from './LinkingConfiguration';
import {
  Dashboard,
  Explore,
  Home,
  LoginPage,
  Settings,
  Room,
  UserRooms,
  Users,
} from 'screens';
import 'react-native-gesture-handler';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import {
  Text,
  extendTheme,
  NativeBaseProvider,
  StorageManager,
  ColorMode,
  HamburgerIcon,
  Button,
  useColorModeValue,
  themeTools,
  View,
  Center,
  HStack,
  Spinner,
  Icon,
} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MaterialCommunityIcons, AntDesign, Entypo } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { MenuOptions } from 'screens/shared';
import NotFoundScreen from 'screens/NotFoundScreen';
import { CreateRoom } from 'screens/Rooms/CreateRoom';
import { AdminHome } from '../screens/Admin/AdminHome';
import { WordRoom } from '../screens/Rooms/WordRoom';
import { ReportsHome } from '../screens/Reports/ReportsHome';
import { RootStackParamList } from 'models';
import { AuthProvider } from 'context/useAuth';

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  const auth = getAuth();
  const [load, setLoad] = React.useState(false);

  useEffect(() => {
    setLoad(false);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoad(true);
      } else {
        // navigation.navigate('Login');
      }
    });
  }, []);

  // if (!loaded) {
  //   return null;
  // }

  const defaultBlackColor = '#3f3f46';

  return (
    <>
      <NativeBaseProvider theme={theme} colorModeManager={colorModeManager}>
        <NavigationContainer
          linking={LinkingConfiguration}
          theme={
            colorScheme === 'dark'
              ? themeNavigationDefault
              : themeNavigationDefault
          }
        >
          <AuthProvider>
            <Tab.Navigator
              initialRouteName="Home"
              tabBar={(props) => <TabBar {...props} />}
              screenOptions={({ navigation, route }) => ({
                tabBarHideOnKeyboard: true,
                unmountOnBlur: true,
                headerStyle: {
                  backgroundColor: useColorModeValue(
                    'white',
                    defaultBlackColor,
                  ),
                  borderBottomWidth: 0,
                  shadow: 'rgb(0 0 0 / 10%) 0px 2px 4px 0px',
                },
                headerTitleStyle: {
                  color: useColorModeValue(theme.colors.coolGray[600], 'white'),
                  fontWeight: 'bold',
                  fontFamily: 'Amiko',
                },
                headerTitle: 'Tinzzio',
                // headerLeft: () => (
                //   <NavigationDrawerStructure navigation={navigation} />
                // ),
                headerRight: () => (
                  <MenuOptions
                    {...({ navigation } as NativeStackHeaderProps)}
                  />
                ),
              })}
            >
              <Stack.Screen name="Home" component={Home} />
              <Tab.Screen name="Dashboard" component={Dashboard} />
              <Tab.Screen
                name="CreateRoom"
                options={{ title: 'Create Quiz' }}
                component={CreateRoom}
              />
              <Tab.Screen name="Explore" component={Explore} />
              <Tab.Screen
                name="Reports"
                options={{ title: 'Reports' }}
                component={ReportsHome}
              />
              <Stack.Screen
                options={{ headerShown: false }}
                name="Login"
                component={LoginPage}
              />
              <Stack.Screen name="Room" component={Room} />
              <Stack.Screen
                name="UserRooms"
                options={{ title: 'Library' }}
                component={UserRooms}
              />
              <Stack.Screen name="Users" component={Users} />
              <Stack.Screen name="Settings" component={Settings} />
              <Stack.Screen name="Admin" component={AdminHome} />
              <Stack.Screen
                name="Word"
                options={{ headerShown: false }}
                component={WordRoom}
              />
              <Stack.Screen
                name="NotFound"
                component={NotFoundScreen}
                options={{ title: 'Page Not Found' }}
              />
            </Tab.Navigator>
          </AuthProvider>
        </NavigationContainer>
      </NativeBaseProvider>
    </>
  );
}

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const currentRoute = descriptors[state.routes[state.index].key].route.name;

  return (
    <>
      {currentRoute !== 'Login' &&
        currentRoute !== 'CreateRoom' &&
        currentRoute !== 'Word' && (
          <View
            pt={2}
            pb={1}
            style={{
              flexDirection: 'row',
              backgroundColor: useColorModeValue('white', '#151515'),
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                if (!isFocused) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              const defaultIconColor = isFocused
                ? 'purple.600'
                : useColorModeValue(theme.colors.coolGray[800], 'white');

              return (
                <>
                  {(route.name === 'Dashboard' ||
                    route.name === 'UserRooms' ||
                    route.name === 'Explore' ||
                    route.name === 'Reports') && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={options.tabBarAccessibilityLabel}
                      testID={options.tabBarTestID}
                      onPress={onPress}
                      onLongPress={onLongPress}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        opacity: isFocused ? 1 : 0.7,
                        backgroundColor: useColorModeValue('white', '#151515'),
                      }}
                      key={index}
                    >
                      {route.name === 'Dashboard' && (
                        <Icon
                          as={AntDesign}
                          name="home"
                          color={defaultIconColor}
                          size="28px"
                        />
                      )}
                      {route.name === 'Explore' && (
                        <Icon
                          as={AntDesign}
                          name="find"
                          color={defaultIconColor}
                          size="28px"
                        />
                      )}
                      {route.name === 'Reports' && (
                        <Icon
                          as={AntDesign}
                          name="barschart"
                          color={defaultIconColor}
                          size="28px"
                        />
                      )}
                      {route.name === 'UserRooms' && (
                        <Icon
                          as={AntDesign}
                          name="book"
                          color={defaultIconColor}
                          size="28px"
                        />
                      )}
                      <Text
                        pt={1}
                        bold
                        fontSize={12}
                        style={{
                          color: isFocused
                            ? theme.colors.purple[600]
                            : defaultIconColor,
                        }}
                      >
                        <>
                          {label === 'Dashboard'
                            ? 'Home'
                            : label === 'UserRooms'
                            ? 'Library'
                            : label}
                        </>
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              );
            })}
          </View>
        )}
    </>
  );
};

const Tab = createBottomTabNavigator();

const NavigationDrawerStructure = ({ navigation }: any) => {
  const toggleDrawer = () => {
    navigation.toggleDrawer();
  };

  return (
    <TouchableOpacity onPress={() => toggleDrawer()}>
      <HamburgerIcon color="purple.700" size={7} ml={2} />
    </TouchableOpacity>
  );
};
export const theme = extendTheme({
  fonts: {
    heading: 'Amiko',
    body: 'Amiko',
    mono: 'Amiko',
  },
  components: {
    Button: {
      // Can simply pass default props to change default behaviour of components.
      variants: {
        default: ({ colorScheme }: any) => {
          return {
            rounded: 'md',
            bg: 'purple.600',
            py: '12px',
            _hover: { bg: 'purple.700' },
            _focus: { bg: 'purple.800' },
            _pressed: { bg: 'purple.800' },
            borderRadius: 8,
            _text: {
              color: 'white',
            },
          };
        },
      },
      baseStyle: {
        variant: 'default',
        _text: { fontWeight: 'bold' },
      },
    },
    ScrollView: {
      baseStyle: (props: any) => {
        return {
          background: themeTools.mode('#F2F2F2', 'black')(props),
        };
      },
    },
    Icon: {
      baseStyle: () => {
        return {
          selectable: false,
        };
      },
    },
    Input: {
      defaultProps: {
        background: 'white',
        _focus: {
          borderColor: 'purple.700',
          bg: 'white',
        },
        _hover: {
          borderColor: 'purple.700',
          bg: 'white',
        },
        _pressed: {
          borderColor: 'purple.700',
          bg: 'white',
        },
      },
    },
    Text: {
      variants: {
        modalHeader: ({ colorMode }: any) => {
          return {
            fontWeight: 'bold',
            fontSize: 20,
            color: colorMode === 'dark' ? 'white' : '#565656',
          };
        },
      },
      baseStyle: ({ colorMode }: any) => {
        return {
          color: colorMode === 'dark' ? 'white' : '#6E6E6E',
          fontWeight: 'normal',
        };
      },
    },
    MenuItem: {
      baseStyle: ({ colorMode }: any) => {
        return {
          background: colorMode === 'dark' ? undefined : 'white',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          _hover: {
            background: 'gray.200',
          },
        };
      },
    },
    Menu: {
      baseStyle: ({ colorMode }: any) => {
        return {
          mr: [2, 5],
          py: 0,
        };
      },
    },
  },
  colors: {
    // Add new color
    black: '#151515',
    light: '#151515',
    // gray: "#F2F2F2",
    primary: {
      50: '#E3F2F9',
      100: '#C5E4F3',
      200: '#A2D4EC',
      300: '#7AC1E4',
      400: '#47A9DA',
      500: '#0088CC',
      600: '#007AB8',
      700: '#006BA1',
      800: '#005885',
      900: '#003F5E',
    },
    purple: {
      500: '#9454EE',
      600: '#8338EC', //main
      700: '#7030CA', //hover
      800: '#5D28A8',
    },
  },
  // config: {
  //   // Changing initialColorMode to 'dark'
  //   useSystemColorMode: true,

  //   initialColorMode: 'dark',
  // },
});

const colorModeManager: StorageManager = {
  get: async () => {
    try {
      const val = await AsyncStorage.getItem('@color-mode');
      return val === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  },
  set: async (value: ColorMode) => {
    try {
      await AsyncStorage.setItem('@color-mode', value as string);
    } catch (e) {
      console.log(e);
    }
  },
};

const themeNavigationDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.colors.black,
  },
};

const themeNavigationDefault = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.white,
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList activeTintColor="#FFFFFF" {...props} />
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();
