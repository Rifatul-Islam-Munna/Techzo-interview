import { create } from 'zustand';

interface SignupState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  
  setField: (key: keyof Omit<SignupState, 'setField' | 'toggleShowPassword' | 'resetForm'>, value: string | boolean) => void;
  toggleShowPassword: () => void;
  resetForm: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  showPassword: false,
  
  // Single function to set any field
  setField: (key, value) => set({ [key]: value }),
  
  toggleShowPassword: () => set((state) => ({ showPassword: !state.showPassword })),
  
  resetForm: () => set({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
  }),
}));
