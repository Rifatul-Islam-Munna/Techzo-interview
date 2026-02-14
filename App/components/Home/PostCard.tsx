import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/lib/apiClient";
import { usePatchMutation, usePostMutation, useQueryWrapper } from "@/lib/react-query-wrapper";

interface Comment {
  _id: string;
  userId: string;
  name: string;
  text: string;
  createdAt: string;
}

interface CommentsResponse {
  success: boolean;
  data: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

interface PostCardProps {
  post: {
    _id: string;
    userId: string;
    postedBy: string;
    description: string;
    like: number;
    comment: number;
    createdAt: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.comment);
  const [user, setUserState] = useState<any>(null);
  const queryClient = useQueryClient();

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      setUserState(userData);
    };
    loadUser();
  }, []);

  // Get comments when modal opens
  const { data: commentsData, isLoading: isLoadingComments, refetch: refetchComments } = useQueryWrapper<CommentsResponse>(
    ['comments', post._id],
    `/posts/${post._id}/comments?page=1&limit=20`,
    {
      enabled: isCommentModalVisible, // Only fetch when modal is open
    }
  );

  // Like/Unlike mutation
  const { mutate: toggleLike, isPending: isLiking } = usePatchMutation(
    ['toggleLike', post._id],
    `/posts/${post._id}/like`,
    {
      showSuccessAlert: false,
      showErrorAlert: true,
      onSuccess: () => {
        // Update local state
        if (liked) {
          setLikeCount(likeCount - 1);
        } else {
          setLikeCount(likeCount + 1);
        }
        setLiked(!liked);
        
        // Invalidate posts to refresh
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }
  );

  // Add comment mutation
  const { mutate: addComment, isPending: isAddingComment } = usePostMutation(
    ['addComment', post._id],
    `/posts/${post._id}/comments`,
    {
      showSuccessAlert: false,
      showErrorAlert: true,
      onSuccess: () => {
        // Refresh comments
        refetchComments();
        
        // Update comment count
        setCommentCount(commentCount + 1);
        
        // Clear input
        setCommentText("");
        
        // Invalidate posts to update comment count
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      },
    }
  );

  const handleLike = () => {
    if (isLiking) return;
    toggleLike({ postId: post._id, increment: !liked });
  };

  const handleAddComment = () => {
    if (commentText.trim() && !isAddingComment) {
      addComment({ text: commentText.trim() });
    }
  };

  const formatTimestamp = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <>
      <View className="bg-white mb-2 shadow-sm">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
            <Text className="text-white font-bold text-base">
              {post?.postedBy?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="text-gray-800 font-semibold text-base">{post?.postedBy}</Text>
            <Text className="text-gray-500 text-xs">{formatTimestamp(post?.createdAt)}</Text>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pb-3">
          <Text className="text-gray-800 text-sm leading-5">{post?.description}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between px-4 py-2 border-t border-b border-gray-200">
          <Text className="text-gray-600 text-xs">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </Text>
          <Text className="text-gray-600 text-xs">
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center justify-around py-1">
          <TouchableOpacity 
            onPress={handleLike}
            disabled={isLiking}
            className="flex-1 flex-row items-center justify-center py-2"
            activeOpacity={0.7}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={20} 
              color={liked ? "#ef4444" : "#6b7280"} 
            />
            <Text className={`ml-2 text-sm font-semibold ${liked ? 'text-red-500' : 'text-gray-700'}`}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsCommentModalVisible(true)}
            className="flex-1 flex-row items-center justify-center py-2"
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text className="text-gray-700 text-sm font-semibold ml-2">Comment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comment Modal */}
      <Modal
        visible={isCommentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-white rounded-t-3xl h-4/5">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">
                Comments ({commentsData?.data?.length || 0})
              </Text>
              <TouchableOpacity onPress={() => setIsCommentModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Post Preview */}
            <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-2">
                  <Text className="text-white font-bold text-xs">
                    {post?.postedBy?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-gray-800 font-semibold text-sm">{post?.postedBy}</Text>
              </View>
              <Text className="text-gray-700 text-xs" numberOfLines={2}>{post?.description}</Text>
            </View>

            {/* Comments List */}
            <ScrollView className="flex-1 px-4 py-3">
              {isLoadingComments ? (
                <View className="flex-1 items-center justify-center py-8">
                  <ActivityIndicator size="small" color="#2563eb" />
                </View>
              ) : commentsData?.data && commentsData.data.length > 0 ? (
                commentsData.data.map((comment) => (
                  <View key={comment._id} className="mb-4">
                    <View className="flex-row">
                      <View className="w-8 h-8 bg-gray-400 rounded-full items-center justify-center mr-2">
                        <Text className="text-white font-bold text-xs">
                          {comment?.name?.charAt(0)?.toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <View className="bg-gray-100 rounded-2xl px-3 py-2">
                          <Text className="text-gray-800 font-semibold text-sm mb-1">
                            {comment.name}
                          </Text>
                          <Text className="text-gray-700 text-sm">{comment.text}</Text>
                        </View>
                        <Text className="text-gray-500 text-xs mt-1 ml-3">
                          {formatTimestamp(comment.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-8">
                  <Text className="text-gray-500 text-sm">No comments yet. Be the first!</Text>
                </View>
              )}
            </ScrollView>

            {/* Comment Input */}
            <View className="flex-row items-center px-4 py-3 border-t border-gray-200">
              <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-2">
                <Text className="text-white font-bold text-xs">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-3 py-1">
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Write a comment..."
                  className="flex-1 py-1.5 text-sm"
                  multiline
                  editable={!isAddingComment}
                />
                <TouchableOpacity 
                  onPress={handleAddComment}
                  disabled={!commentText.trim() || isAddingComment}
                >
                  {isAddingComment ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <Ionicons 
                      name="send" 
                      size={20} 
                      color={commentText.trim() ? "#2563eb" : "#d1d5db"} 
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
