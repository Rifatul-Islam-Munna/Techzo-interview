import { create } from 'zustand';

interface Post {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

interface PostState {
  posts: Post[];
  newPostContent: string;
  isModalVisible: boolean;
  
  setNewPostContent: (content: string) => void;
  openModal: () => void;
  closeModal: () => void;
  addPost: (username: string) => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  newPostContent: "",
  isModalVisible: false,
  
  setNewPostContent: (content) => set({ newPostContent: content }),
  
  openModal: () => set({ isModalVisible: true }),
  
  closeModal: () => set({ isModalVisible: false, newPostContent: "" }),
  
  addPost: (username) => set((state) => {
    if (!state.newPostContent.trim()) return state;
    
    const newPost: Post = {
      id: Date.now().toString(),
      username,
      content: state.newPostContent,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
    };
    
    return {
      posts: [newPost, ...state.posts],
      newPostContent: "",
      isModalVisible: false,
    };
  }),
}));
