import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';

import CreatePostTrigger from '@/components/Home/CreatePostTrigger';
import PostCard from '@/components/Home/PostCard';
import CreatePostModal from '@/components/Home/CreatePostModal';
import { getUser, logout } from '@/lib/apiClient';
import { GetRequest } from '@/lib/api-hooks';
import { useDebounce } from 'use-debounce';
interface Post {
  _id: string;
  userId: string;
  postedBy: string;
  description: string;
  like: number;
  comment: number;
  createdAt: string;
}

interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'my-posts'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUserState] = useState<any>(null);
  const [value] = useDebounce(searchQuery, 1000);
  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      setUserState(userData);
    };
    loadUser();
  }, []);

  // Feed posts (all posts) with infinite scroll
  const {
    data: feedData,
    fetchNextPage: fetchNextFeedPage,
    hasNextPage: hasNextFeedPage,
    isFetchingNextPage: isFetchingNextFeedPage,
    isLoading: isFeedLoading,
    refetch: refetchFeed,
  } = useInfiniteQuery({
    queryKey: ['posts', 'feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const [data, error] = await GetRequest<PostsResponse>(`/posts?page=${pageParam}&limit=10`);
      if (error) throw new Error(error.message);
      if (!data) throw new Error('No data');
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // My posts with infinite scroll
  const {
    data: myPostsData,
    fetchNextPage: fetchNextMyPostsPage,
    hasNextPage: hasNextMyPostsPage,
    isFetchingNextPage: isFetchingNextMyPostsPage,
    isLoading: isMyPostsLoading,
    refetch: refetchMyPosts,
  } = useInfiniteQuery({
    queryKey: ['posts', 'my-posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const [data, error] = await GetRequest<PostsResponse>(`/posts/my?page=${pageParam}&limit=10`);
      if (error) throw new Error(error.message);
      if (!data) throw new Error('No data');
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === 'my-posts', // Only fetch when tab is active
  });

  // Search posts by username
  const {
    data: searchData,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useInfiniteQuery({
    queryKey: ['posts', 'search', value],
    queryFn: async ({ pageParam = 1 }) => {
      const [data, error] = await GetRequest<PostsResponse>(
        `/posts/search?username=${value}&page=${pageParam}&limit=10`
      );
      if (error) throw new Error(error.message);
      if (!data) throw new Error('No data');
      return data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: value.length > 0, // Only search when query exists
  });

  const handleLogout = async () => {
    await logout();
  };

  // Get current posts based on active tab and search
  const getCurrentPosts = () => {
    if (searchQuery.length > 0) {
      return searchData?.pages.flatMap((page) => page.data) || [];
    }
    if (activeTab === 'feed') {
      return feedData?.pages.flatMap((page) => page.data) || [];
    }
    return myPostsData?.pages.flatMap((page) => page.data) || [];
  };

  const displayPosts = getCurrentPosts();

  console.log('displayPosts', displayPosts);

  // Get loading state
  const isLoading =
    searchQuery.length > 0
      ? isSearchLoading
      : activeTab === 'feed'
        ? isFeedLoading
        : isMyPostsLoading;

  // Handle scroll to bottom (load more)
  const handleLoadMore = () => {
    if (searchQuery.length > 0) return; // Don't load more for search

    if (activeTab === 'feed' && hasNextFeedPage && !isFetchingNextFeedPage) {
      fetchNextFeedPage();
    } else if (activeTab === 'my-posts' && hasNextMyPostsPage && !isFetchingNextMyPostsPage) {
      fetchNextMyPostsPage();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'SocialHub',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} className="mr-4">
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 bg-gray-50">
        {/* User Welcome */}
        {user && (
          <View className="bg-blue-600 px-4 py-2">
            <Text className="text-sm text-white">Welcome, {user.name}! 👋</Text>
          </View>
        )}

        {/* Create Post Trigger */}
        <CreatePostTrigger />

        {/* Search Bar */}
        <View className="border-b border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center rounded-full bg-gray-100 px-4 py-2">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by username..."
              className="ml-2 flex-1 text-sm"
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs - Hidden when searching */}
        {searchQuery.length === 0 && (
          <View className="flex-row border-b border-gray-200 bg-white">
            <TouchableOpacity
              onPress={() => setActiveTab('feed')}
              className={`flex-1 items-center border-b-2 py-3 ${
                activeTab === 'feed' ? 'border-blue-600' : 'border-transparent'
              }`}
              activeOpacity={0.7}>
              <Text
                className={`text-sm font-semibold ${
                  activeTab === 'feed' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                Feed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('my-posts')}
              className={`flex-1 items-center border-b-2 py-3 ${
                activeTab === 'my-posts' ? 'border-blue-600' : 'border-transparent'
              }`}
              activeOpacity={0.7}>
              <Text
                className={`text-sm font-semibold ${
                  activeTab === 'my-posts' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                My Posts
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Posts List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom =
                layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

              if (isCloseToBottom) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}>
            {displayPosts.length > 0 ? (
              <>
                {displayPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}

                {/* Loading more indicator */}
                {(isFetchingNextFeedPage || isFetchingNextMyPostsPage) && (
                  <View className="py-4">
                    <ActivityIndicator size="small" color="#2563eb" />
                  </View>
                )}

                {/* No more posts */}
                {!hasNextFeedPage && !hasNextMyPostsPage && searchQuery.length === 0 && (
                  <View className="py-4">
                    <Text className="text-center text-sm text-gray-500">No more posts</Text>
                  </View>
                )}
              </>
            ) : (
              <View className="items-center justify-center p-8">
                <Text className="text-center text-gray-500">
                  {searchQuery.length > 0
                    ? `No posts found for "${searchQuery}"`
                    : activeTab === 'my-posts'
                      ? 'No posts yet. Create your first post!'
                      : 'No posts in feed yet.'}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        <CreatePostModal />
      </View>
    </>
  );
}
