import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePostStore } from "@/store/postStore";
import { useState, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/lib/apiClient";
import { usePostMutation } from "@/lib/react-query-wrapper";

interface CreatePostResponse {
  success: boolean;
  data: any;
}

interface CreatePostRequest {
  description: string;
}

export default function CreatePostModal() {
  const { isModalVisible, newPostContent, setNewPostContent, closeModal } = usePostStore();
  const [user, setUser] = useState<any>(null);
  const queryClient = useQueryClient();

  // Load user from SecureStore
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Create post mutation
  const { mutate: createPost, isPending } = usePostMutation<CreatePostResponse, CreatePostRequest>(
    ['createPost'],
    '/posts',
    {
      successMessage: 'Post created successfully!',
      showSuccessAlert: true,
      onSuccess: () => {
        // Invalidate posts query to refetch
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['myPosts'] });
        
        // Clear input and close modal
        setNewPostContent('');
        closeModal();
      },
      onError: (error) => {
        console.error('Create post error:', error);
      },
    }
  );

  const handlePost = () => {
    if (newPostContent.trim()) {
      createPost({ description: newPostContent.trim() });
    }
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-3xl h-4/5">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <View className="w-8" />
            <Text className="text-lg font-bold text-gray-800">Create Post</Text>
            <TouchableOpacity onPress={closeModal} disabled={isPending}>
              <Ionicons name="close-circle" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="flex-row items-center px-4 py-3">
            <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-base">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text className="text-gray-800 font-semibold text-base">
                {user?.name || 'User'}
              </Text>
              <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-0.5 mt-0.5">
                <Ionicons name="globe-outline" size={12} color="#6b7280" />
                <Text className="text-gray-600 text-xs ml-1">Public</Text>
              </View>
            </View>
          </View>

          {/* Text Input */}
          <View className="flex-1 px-4">
            <TextInput
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder={`What's on your mind, ${user?.username || 'User'}?`}
              multiline
              className="text-base text-gray-800 h-full"
              style={{ textAlignVertical: 'top' }}
              autoFocus
              editable={!isPending}
            />
          </View>

          {/* Bottom Actions */}
          <View className="px-4 pb-4">
            {/* Quick Actions */}
            <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-xl p-3 mb-3">
              <Text className="text-gray-700 font-semibold text-sm">Add to your post</Text>
              <View className="flex-row items-center">
                <TouchableOpacity className="p-1.5" disabled>
                  <Ionicons name="images-outline" size={24} color="#d1d5db" />
                </TouchableOpacity>
                <TouchableOpacity className="p-1.5 ml-2" disabled>
                  <Ionicons name="happy-outline" size={24} color="#d1d5db" />
                </TouchableOpacity>
                <TouchableOpacity className="p-1.5 ml-2" disabled>
                  <Ionicons name="location-outline" size={24} color="#d1d5db" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Post Button */}
            <TouchableOpacity
              onPress={handlePost}
              disabled={!newPostContent.trim() || isPending}
              className={`rounded-xl py-3 items-center ${
                newPostContent.trim() && !isPending ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              activeOpacity={0.8}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className={`font-bold text-base ${
                  newPostContent.trim() ? 'text-white' : 'text-gray-500'
                }`}>
                  Post
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
