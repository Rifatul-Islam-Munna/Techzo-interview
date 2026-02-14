import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLoginStore } from '@/store/loginStore';
import { usePostMutation } from '@/lib/react-query-wrapper';
import { setToken } from '@/lib/api-hooks';
import { setUser } from '@/lib/apiClient';
import { getFCMToken } from '@/lib/notificationService';

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
    };
    token: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
  token?: string | null;
}

export default function LoginPage() {
  const { email, password, showPassword, setField, toggleShowPassword, resetForm } =
    useLoginStore();

  // Login mutation
  const {
    mutate: login,
    isPending,
    error,
  } = usePostMutation<LoginResponse, LoginRequest>(['login'], '/users/login', {
    successMessage: 'Login successful!',
    showSuccessAlert: false,
    onSuccess: async (data) => {
      // Save token to SecureStore
      await setToken(data.data.token);

      // Save user to SecureStore
      await setUser(data.data.user);

      // Reset form
      resetForm();
      console.log('Login success:', data);
      // Navigate to home
      router.replace('/');
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill all fields!');
      return;
    }

    if (!email.includes('@')) {
      alert('Please enter a valid email!');
      return;
    }
    const token = await getFCMToken();

    // Call API
    login({ email, password, token: token });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-blue-50">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Logo/Brand Section */}
          <View className="mb-6 items-center">
            <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <Ionicons name="people" size={32} color="white" />
            </View>
            <Text className="text-3xl font-bold text-blue-600">SocialHub</Text>
          </View>

          {/* Login Form */}
          <View className="rounded-3xl bg-white p-5 shadow-lg">
            <Text className="mb-4 text-xl font-bold text-gray-800">Welcome Back</Text>

            {/* Error Message */}
            {error && (
              <View className="mb-4 flex-row items-center rounded-xl border border-red-200 bg-red-50 p-3">
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text className="ml-2 flex-1 text-xs text-red-600">{error.message}</Text>
              </View>
            )}

            {/* Email Input */}
            <View className="mb-3">
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                <Ionicons name="mail-outline" size={18} color="#6b7280" />
                <TextInput
                  value={email}
                  onChangeText={(value) => setField('email', value)}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="ml-2 flex-1 text-sm"
                  editable={!isPending}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
                <TextInput
                  value={password}
                  onChangeText={(value) => setField('password', value)}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  className="ml-2 flex-1 text-sm"
                  editable={!isPending}
                />
                <TouchableOpacity onPress={toggleShowPassword} disabled={isPending}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isPending}
              className={`items-center rounded-xl py-3 shadow-sm ${
                isPending ? 'bg-blue-400' : 'bg-blue-600'
              }`}
              activeOpacity={0.8}>
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Signup Link */}
          <View className="mt-4 flex-row items-center justify-center">
            <Text className="text-sm text-gray-600">Don't have an account? </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity disabled={isPending}>
                <Text className="text-sm font-bold text-blue-600">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
