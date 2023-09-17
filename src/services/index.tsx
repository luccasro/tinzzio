import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { firebaseConfig } from "../config";
import { IconType, UserData } from "models";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";


// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();
export const db = getFirestore();

export const generateUserDocument = async ({ navigation }: NativeStackHeaderProps, user: User) => {
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      userName: user.uid,
      name: user.displayName,
      email: user.email,
      created_at: new Date().toLocaleString() + "",
      photoUrl: user.photoURL,
      notifications: [{
        text: "Welcome to Tinzzio!",
        createdAt: new Date().toLocaleString() + "",
        read: false,
        type: "info"
      }]
    } as UserData).then(async () => {
      await setDoc(doc(db, "usernames", user.uid), {
       id: user.uid,
      })
      getUserData(user.uid).then(() => {
        navigation.navigate('Home');
      })
    }
      );
  } else {
    navigation.navigate('Dashboard');
  }
};

export const getUserData = async (userId?: string): Promise<any> => {
  if(!userId && auth.currentUser){
    userId = auth.currentUser.uid
  }
  if(userId){
  const docRef = doc(db, "users", userId);

  return (await (getDoc(docRef))).data()
  }
}

export const checkIfLoggedIn = ({ navigation }: NativeStackHeaderProps, afterSuccess?: (user: User) => void, afterFailed?: void) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      afterSuccess?.(user)
      } else {
        afterFailed?? navigation.navigate('Login');
    }
  });
};

export const logout = async ({ navigation }: NativeStackHeaderProps) => {
  signOut(auth).then(() => {
    navigation.navigate('Home')
  }).catch((error) => {
    console.log(error)
  });
}

export const getIconType = (iconType?: IconType) => {
  // "MaterialCommunityIcons", "MaterialIcons", "AntDesign", "Entypo", "Ionicons", "Ionicons", "Foundation", "FontAwesome", "FontAwesome5"

  let type = undefined
  switch (iconType) {
    case 'MaterialCommunityIcons':
      type = MaterialCommunityIcons;
      break;
    case 'AntDesign':
      type = AntDesign;
      break;
  }
  return type
}
