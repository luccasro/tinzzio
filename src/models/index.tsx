import { ParamListBase } from '@react-navigation/native';
import { DocumentData } from 'firebase/firestore';
export interface RootStackParamList extends ParamListBase {
  Login: undefined;
  Room: { roomId: string };
  Users: { username: string };
}

export interface UserData extends DocumentData {
  id: string;
  userName: string;
  name?: string | null;
  email: string;
  created_at: number | string | Date;
  photoUrl?: string | null;
  rooms: RoomData[];
  notifications?: Notification[];
  admin?: boolean;
}

export interface RoomData {
  id: string;
  name: string;
  owner: {
    id: string;
    userName: string;
    name: string | null;
  };
  created_at?: number | string | Date;
  disabled: boolean;
  privacy: 'public' | 'private' | 'link';
  questions: QuestionOptions[];
  participants?: RoomParticipants[];
}

export interface RoomParticipants {
  id: string;
  answers?: QuestionValues[];
}

export interface QuestionValues {
  value: string;
  isCorrect: boolean;
}

export interface QuestionOptions {
  name: string;
  a: string;
  b?: string;
  c?: string;
  d?: string;
  correctOption: 'a' | 'b' | 'c' | 'd' | string;
}

export interface Notification {
  text: string;
  createdAt?: number | string | Date;
  read: boolean;
  entityId?: string;
  type?: 'info' | 'entity' | 'link';
}

export interface Category {
  name: string;
  translation_en?: string;
  translation_pt?: string;
  icon?: string;
  iconType?: IconType;
}

export interface IconType {
  type?:
    | 'MaterialCommunityIcons'
    | 'MaterialIcons'
    | 'AntDesign'
    | 'Entypo'
    | 'Ionicons'
    | 'Ionicons'
    | 'Foundation'
    | 'FontAwesome'
    | 'FontAwesome5';
}

export const validIconType = [
  'MaterialCommunityIcons',
  'MaterialIcons',
  'AntDesign',
  'Entypo',
  'Ionicons',
  'Ionicons',
  'Foundation',
  'FontAwesome',
  'FontAwesome5',
];
