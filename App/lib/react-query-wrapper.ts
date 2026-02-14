import { 
  QueryKey, 
  useMutation, 
  useQuery, 
  UseQueryOptions,
  UseMutationOptions,
  MutationKey 
} from "@tanstack/react-query";
import { Alert } from "react-native";
import { GetRequest, PostRequest, PatchRequest, DeleteRequest } from "./api-hooks";

// ==================== QUERY WRAPPER ====================

export function useQueryWrapper<T>(
  key: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey: key,
    queryFn: async () => {
      console.log('🔍 [QUERY] Fetching:', { key, url });
      const [data, error] = await GetRequest<T>(url);
      
      if (error) {
        console.error('❌ [QUERY ERROR]:', { key, url, error: error.message });
        throw new Error(error.message);
      }
      
      if (!data) {
        console.error('❌ [QUERY] No data received:', { key, url });
        throw new Error('No data received');
      }
      
      console.log('✅ [QUERY SUCCESS]:', { key, url });
      return data;
    },
    ...options,
  });
}

// ==================== MUTATION WRAPPER ====================

type HttpMethod = 'POST' | 'PATCH' | 'DELETE';

interface UseApiMutationConfig<TData = any, TVariables = any> {
  url: string | ((variables: TVariables) => string); // Support dynamic URLs
  method: HttpMethod;
  mutationKey?: MutationKey;
  successMessage?: string;
  showSuccessAlert?: boolean; // Default true
  showErrorAlert?: boolean; // Default true
  onSuccess?: (data: TData) => void;
  onError?: (error: { message: string; statusCode: number }) => void;
}

export function useCommonMutation<TData = any, TVariables = any>(
  config: UseApiMutationConfig<TData, TVariables>
) {
  const {
    url,
    method,
    mutationKey,
    successMessage = 'Success!',
    showSuccessAlert = true,
    showErrorAlert = true,
    onSuccess,
    onError,
  } = config;

  // Select the right function based on method
  const getMutationFn = () => {
    switch (method) {
      case 'POST':
        return async (variables: TVariables) => {
          const endpoint = typeof url === 'function' ? url(variables) : url;
          const [response, error] = await PostRequest<TData>(endpoint, variables);
          return { data: response, error };
        };

      case 'PATCH':
        return async (variables: TVariables) => {
          const endpoint = typeof url === 'function' ? url(variables) : url;
          const [response, error] = await PatchRequest<TData>(endpoint, variables);
          return { data: response, error };
        };

      case 'DELETE':
        return async (variables: TVariables) => {
          const endpoint = typeof url === 'function' ? url(variables) : url;
          const [response, error] = await DeleteRequest<TData>(endpoint);
          return { data: response, error };
        };

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  };

 return useMutation({
    mutationKey,
    mutationFn: async (variables: TVariables) => {
      console.log('🚀 [MUTATION] Starting:', { method, url, mutationKey, variables });
      const mutationFn = getMutationFn();
      const result = await mutationFn(variables);
      
      if (result?.error) {
        console.error('❌ [MUTATION ERROR]:', { method, url, error: result.error });
      } else {
        console.log('✅ [MUTATION SUCCESS]:', { method, url });
      }
      
      return result;
    },
    onSuccess: (result) => {
      if (result?.data) {
        if (showSuccessAlert) {
          Alert.alert('Success', successMessage);
        }
        onSuccess?.(result.data);
      } else if (result?.error) {
        if (showErrorAlert) {
          Alert.alert('Error', result.error.message);
        }
        onError?.(result.error);
      }
    },
    onError: (error: Error) => {
      console.error('❌ [MUTATION FATAL]:', error);
      if (showErrorAlert) {
        Alert.alert('Error', error.message);
      }
      onError?.({ message: error.message, statusCode: 500 });
    },
  });
}

// ==================== INDIVIDUAL MUTATION HELPERS ====================

// POST Mutation Helper
export function usePostMutation<TData, TVariables>(
  mutationKey: MutationKey,
  url: string | ((variables: TVariables) => string),
  options?: Omit<UseApiMutationConfig<TData, TVariables>, 'method' | 'url' | 'mutationKey'>
) {
  return useCommonMutation<TData, TVariables>({
    mutationKey,
    url,
    method: 'POST',
    ...options,
  });
}

// PATCH Mutation Helper
export function usePatchMutation<TData, TVariables>(
  mutationKey: MutationKey,
  url: string | ((variables: TVariables) => string),
  options?: Omit<UseApiMutationConfig<TData, TVariables>, 'method' | 'url' | 'mutationKey'>
) {
  return useCommonMutation<TData, TVariables>({
    mutationKey,
    url,
    method: 'PATCH',
    ...options,
  });
}

// DELETE Mutation Helper
export function useDeleteMutation<TData, TVariables>(
  mutationKey: MutationKey,
  url: string | ((variables: TVariables) => string),
  options?: Omit<UseApiMutationConfig<TData, TVariables>, 'method' | 'url' | 'mutationKey'>
) {
  return useCommonMutation<TData, TVariables>({
    mutationKey,
    url,
    method: 'DELETE',
    ...options,
  });
}
