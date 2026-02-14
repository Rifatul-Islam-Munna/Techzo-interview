import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import Constants from 'expo-constants';
const baseUrl = Constants.expoConfig?.extra?.apiUrl || "http://192.168.0.104:4000/api/v1";

// Get token from SecureStore
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Save token to SecureStore
export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync('access_token', token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Remove token from SecureStore
export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('access_token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Parse Axios error
// Parse Axios error
function parseAxiosError(error: AxiosError): { message: string; statusCode: number } {
  const res = error?.response?.data as any;
  const statusCode = error?.response?.status ?? 500;

  console.log('🔍 Full Error Response:', {
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    data: error?.response?.data,
    config: {
      url: error?.config?.url,
      method: error?.config?.method,
      data: error?.config?.data,
    }
  });

  let message = 'Something went wrong';

  if (res?.message) {
    if (Array.isArray(res.message)) {
      message = res.message[0];
    } else if (typeof res.message === 'string') {
      message = res.message;
    }
  }

  return { message, statusCode };
}


// POST Request
export const PostRequest = async <T>(
  url: string,
  payload: any
): Promise<[T | null, { message: string; statusCode: number } | null]> => {
  const token = await getToken();

  try {
    const { data } = await axios.post<T>(`${baseUrl}${url}`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    return [data, null];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        await removeToken();
        router.replace('/login');
        return [null, { message: 'Unauthorized', statusCode: 401 }];
      }

      const errorMsg = parseAxiosError(error);
      return [null, errorMsg];
    }

    return [null, { message: 'Network error', statusCode: 0 }];
  }
};

// PATCH Request
export const PatchRequest = async <T>(
  url: string,
  payload: any
): Promise<[T | null, { message: string; statusCode: number } | null]> => {
  const token = await getToken();

  try {
    const { data } = await axios.patch<T>(`${baseUrl}${url}`, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    return [data, null];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await removeToken();
        router.replace('/login');
        return [null, { message: 'Unauthorized', statusCode: 401 }];
      }

      const errorMsg = parseAxiosError(error);
      return [null, errorMsg];
    }

    return [null, { message: 'Network error', statusCode: 0 }];
  }
};

// GET Request
export const GetRequest = async <T>(
  url: string
): Promise<[T | null, { message: string; statusCode: number } | null]> => {
  const token = await getToken();

  try {
    const { data } = await axios.get<T>(`${baseUrl}${url}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    return [data, null];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        await removeToken();
        router.replace('/login');
        return [null, { message: 'Unauthorized', statusCode: 401 }];
      }

      const errorMsg = parseAxiosError(error);
      return [null, errorMsg];
    }

    return [null, { message: 'Network error', statusCode: 0 }];
  }
};

// DELETE Request
export const DeleteRequest = async <T>(
  url: string
): Promise<[T | null, { message: string; statusCode: number } | null]> => {
  const token = await getToken();

  try {
    const { data } = await axios.delete<T>(`${baseUrl}${url}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    return [data, null];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        await removeToken();
        router.replace('/login');
        return [null, { message: 'Unauthorized', statusCode: 401 }];
      }

      const errorMsg = parseAxiosError(error);
      return [null, errorMsg];
    }

    return [null, { message: 'Network error', statusCode: 0 }];
  }
};
