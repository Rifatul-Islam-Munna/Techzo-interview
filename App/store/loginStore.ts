import { create } from 'zustand';

interface LoginState {
  email: string;
  password: string;
  showPassword: boolean;
  
  setField: (key: keyof Omit<LoginState, 'setField' | 'toggleShowPassword' | 'resetForm'>, value: string | boolean) => void;
  toggleShowPassword: () => void;
  resetForm: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  email: "",
  password: "",
  showPassword: false,
  
  setField: (key, value) => set({ [key]: value }),
  
  toggleShowPassword: () => set((state) => ({ showPassword: !state.showPassword })),
  
  resetForm: () => set({
    email: "",
    password: "",
    showPassword: false,
  }),
}));
