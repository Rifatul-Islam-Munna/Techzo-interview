import Post, { IPost } from '@/models/post.model';
import Comment, { IComment } from '@/models/comment.model';
import admin from '@/config/firebase';

// ==================== POST SERVICES ====================

// Get all posts with pagination
export const getAllPosts = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Post.countDocuments().exec(),
  ]);

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Get my posts with pagination
export const getMyPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ userId })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Post.countDocuments({ userId }).exec(),
  ]);

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Search posts by username with pagination
export const searchPostsByUsername = async (
  username: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  const query = { postedBy: { $regex: username, $options: 'i' } };

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Post.countDocuments(query).exec(),
  ]);

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Create post
export const createPost = async (
  userId: string,
  postedBy: string,
  description: string
): Promise<IPost> => {
  const post = new Post({
    userId,
    postedBy,
    description,
    like: 0,
    comment: 0,
  });
  return post.save();
};

// Get single post by ID
export const getPostById = async (postId: string): Promise<IPost | null> => {
  const post = await Post.findById(postId)
    .populate('userId', 'username email')
    .exec();
  return post;
};

// Update like count
export const updateLikeCount = async (postId: string, increment: boolean): Promise<IPost | null> => {
  const post = await Post.findByIdAndUpdate(
    postId,
    { $inc: { like: increment ? 1 : -1 } },
    { new: true }
  ).populate("userId").exec();
   console.log(post?.userId)
   try{
     admin.messaging().send({
            token: post?.userId?.token,
            notification: {
              title: 'New Like ❤️',
              body: ` liked your post`,

              
            },
            data: {
              postId: postId,
              type: 'like',
              userId: post?.userId?._id.toString() ?? "",
            },
            android: {
              priority: 'high',
            },
          });

   }catch(error){
    console.log(error)
   }
   
  return post;
};

// ==================== COMMENT SERVICES ====================

// Get all comments for a post with pagination
export const getCommentsByPostId = async (
  postId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ postId })
      .populate('userId', 'username email')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Comment.countDocuments({ postId }).exec(),
  ]);

  return {
    comments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Create comment
export const createComment = async (
  postId: string,
  userId: string,
  name: string,
  text: string
): Promise<IComment | null> => {
  const comment =  await Comment.create({
    postId,
    userId,
    name,
    text,
  });

  const post = await Post.findById(postId).populate("userId").exec();
 

  await Post.findByIdAndUpdate(postId, { $inc: { comment: 1 } }).exec();
   
          try{
     
     admin.messaging().send({
            token: post?.userId?.token,
            notification: {
              title: 'New Like Comment',
              body: ` comment your post`,
            },
            data: {
              postId: postId,
              type: 'comment',
              userId: post?.userId?._id.toString() ?? "",
            },
            android: {
              priority: 'high',
            },
          });

   }catch(error){
    console.log(error)
   }
  return comment;
};

// Get comment count for a post
export const getCommentCount = async (postId: string): Promise<number> => {
  const count = await Comment.countDocuments({ postId }).exec();
  return count;
};
