import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePostStore } from "@/store/postStore";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/apiClient";

export default function CreatePostTrigger() {
  const { openModal } = usePostStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  return (
    <View className="bg-white p-4 mb-2 shadow-sm">
      <TouchableOpacity 
        onPress={openModal}
        className="flex-row items-center"
        activeOpacity={0.7}
      >
        {/* User Avatar */}
        <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
          <Text className="text-white font-bold text-base">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>

        {/* Input Trigger */}
        <View className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 border border-gray-200">
          <Text className="text-gray-500 text-sm">
            What's on your mind, {user?.name || 'User'}?
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons Row */}
   {/*    <View className="flex-row items-center justify-around mt-3 pt-3 border-t border-gray-200">
        <TouchableOpacity 
          className="flex-row items-center px-3 py-2"
          activeOpacity={0.7}
          disabled
        >
          <Ionicons name="images-outline" size={20} color="#d1d5db" />
          <Text className="text-gray-400 text-xs font-semibold ml-2">Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center px-3 py-2"
          activeOpacity={0.7}
          disabled
        >
          <Ionicons name="videocam-outline" size={20} color="#d1d5db" />
          <Text className="text-gray-400 text-xs font-semibold ml-2">Video</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center px-3 py-2"
          activeOpacity={0.7}
          disabled
        >
          <Ionicons name="happy-outline" size={20} color="#d1d5db" />
          <Text className="text-gray-400 text-xs font-semibold ml-2">Feeling</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}
