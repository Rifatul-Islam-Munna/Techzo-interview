import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Link, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSignupStore } from "@/store/signupStore";
import { usePostMutation } from "@/lib/react-query-wrapper";


interface SignupResponse {
  success: boolean;
  data: {
    _id: string;
    username: string;
    email: string;
  };
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const { 
    username, 
    email, 
    password, 
    confirmPassword, 
    showPassword,
    setField,
    toggleShowPassword,
    resetForm
  } = useSignupStore();

  // Signup mutation
  const { mutate: signup, isPending, error } = usePostMutation<SignupResponse, SignupRequest>(
    ['signup'],
    '/users',
    {
      successMessage: 'Account created successfully!',
      showSuccessAlert: true,
      onSuccess: (data) => {
        console.log('Signup success:', data);
        resetForm();
        // Navigate to login after successful signup
        setTimeout(() => {
          router.push('/login');
        }, 500);
      },
      onError: (error) => {
        console.error('Signup error:', error);
      },
    }
  );

  const handleSignup = () => {
    // Client-side validation
    if (!username || !email || !password) {
      alert("Please fill all fields!");
      return;
    }

    if (username.length < 3) {
      alert("Username must be at least 3 characters!");
      return;
    }

    if (!email.includes('@')) {
      alert("Please enter a valid email!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    // Call API
    signup({ name:username, email, password });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-blue-50"
    >
      <Stack.Screen options={{ title: 'Signup', headerShown: false }} />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Brand Section */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mb-2">
            <Ionicons name="people" size={32} color="white" />
          </View>
          <Text className="text-3xl font-bold text-blue-600">SocialHub</Text>
        </View>

        {/* Signup Form */}
        <View className="bg-white rounded-3xl p-5 shadow-lg">
          <Text className="text-xl font-bold text-gray-800 mb-4">Create Account</Text>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="text-red-600 text-xs ml-2 flex-1">{error.message}</Text>
            </View>
          )}

          {/* Username Input */}
          <View className="mb-3">
            <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
              <Ionicons name="person-outline" size={18} color="#6b7280" />
              <TextInput
                value={username}
                onChangeText={(value) => setField('username', value)}
                placeholder="Username"
                className="flex-1 ml-2 text-sm"
                autoCapitalize="none"
                editable={!isPending}
              />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-3">
            <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
              <Ionicons name="mail-outline" size={18} color="#6b7280" />
              <TextInput
                value={email}
                onChangeText={(value) => setField('email', value)}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-2 text-sm"
                editable={!isPending}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-3">
            <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
              <TextInput
                value={password}
                onChangeText={(value) => setField('password', value)}
                placeholder="Password"
                secureTextEntry={!showPassword}
                className="flex-1 ml-2 text-sm"
                editable={!isPending}
              />
              <TouchableOpacity onPress={toggleShowPassword} disabled={isPending}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={18} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-4">
            <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
              <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
              <TextInput
                value={confirmPassword}
                onChangeText={(value) => setField('confirmPassword', value)}
                placeholder="Confirm Password"
                secureTextEntry={!showPassword}
                className="flex-1 ml-2 text-sm"
                editable={!isPending}
              />
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={isPending}
            className={`rounded-xl py-3 items-center shadow-sm ${
              isPending ? 'bg-blue-400' : 'bg-blue-600'
            }`}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center items-center mt-4">
          <Text className="text-gray-600 text-sm">Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity disabled={isPending}>
              <Text className="text-blue-600 font-bold text-sm">Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
