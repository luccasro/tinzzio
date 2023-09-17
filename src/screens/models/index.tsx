export interface UserData {
    id: string;
    userName: string;
    name?: string | null;
    email: string;
    created_at: number | string | Date;
    photoUrl?: string | null;
    rooms:  RoomData[]
    notifications?: Notification[]
  }
  
  export interface RoomData{
    id: string;
    name: string;
    owner: {
      id: string;
      name: string | null;
    }
    created_at?: number | string | Date;
    disabled: boolean;
    privacy: "public" | "private" | "link";
    category?: string;
    questions: QuestionOptions[];
  }
  
  export interface QuestionOptions {
    name: string
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
    type?: "info" | "entity" | "link";
  }