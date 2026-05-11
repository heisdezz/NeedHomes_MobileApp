export interface Sender {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sender: Sender;
}

export interface Conversation {
  id: string;
  userId: string;
  adminId: string | null;
  status: "PENDING" | "ACTIVE" | "CLOSED";
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  messages: Message[];
}
