import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';





export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('access_token', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('access_token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// ==================== USER FUNCTIONS ====================

export const getUser = async (): Promise<any | null> => {
  try {
    const userJson = await SecureStore.getItemAsync('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const setUser = async (user: any): Promise<void> => {
  try {
    await SecureStore.setItemAsync('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('user');
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

// ==================== LOGOUT ====================

export const logout = async (): Promise<void> => {
  await removeToken();
  await removeUser();
  router.replace('/login');
};


