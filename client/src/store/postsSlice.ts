import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { PostsState, Post, Comment } from '../types';

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  sortBy: 'newest',
  searchQuery: '',
};

// Fetch all posts from JSON server
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await fetch('/api/posts');
  const data = await response.json();
  return data.map((post: any) => ({
    id: String(post.id),
    userId: String(post.userId),
    username: post.username || '',
    title: post.title,
    body: post.body,
    createdAt: post.createdAt || new Date().toISOString(),
    comments: post.comments || [],
  }));
});

// Create a new post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: Omit<Post, 'id' | 'createdAt' | 'comments'>) => {
    const newPost = {
      ...postData,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      comments: [],
    };
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost),
    });
    return await response.json();
  }
);

// Update a post
export const updatePostAsync = createAsyncThunk(
  'posts/updatePost',
  async ({ id, title, body, userId }: { id: string; title: string; body: string; userId: string }, { getState }) => {
    const state = getState() as { posts: PostsState };
    const existingPost = state.posts.posts.find(p => p.id === id);
    if (!existingPost || existingPost.userId !== userId) {
      throw new Error('Unauthorized');
    }
    const updatedPost = { ...existingPost, title, body };
    const response = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost),
    });
    return await response.json();
  }
);

// Delete a post
export const deletePostAsync = createAsyncThunk(
  'posts/deletePost',
  async ({ id, userId }: { id: string; userId: string }, { getState }) => {
    const state = getState() as { posts: PostsState };
    const existingPost = state.posts.posts.find(p => p.id === id);
    if (!existingPost || existingPost.userId !== userId) {
      throw new Error('Unauthorized');
    }
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    return id;
  }
);

// Add a comment to a post
export const addCommentAsync = createAsyncThunk(
  'posts/addComment',
  async (commentData: Omit<Comment, 'id' | 'createdAt'>, { getState }) => {
    const state = getState() as { posts: PostsState };
    const post = state.posts.posts.find(p => p.id === commentData.postId);
    if (!post) throw new Error('Post not found');

    const newComment: Comment = {
      ...commentData,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };

    const updatedPost = {
      ...post,
      comments: [...post.comments, newComment],
    };

    const response = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost),
    });
    return await response.json();
  }
);

// Update a comment
export const updateCommentAsync = createAsyncThunk(
  'posts/updateComment',
  async ({ postId, commentId, body, userId }: { postId: string; commentId: string; body: string; userId: string }, { getState }) => {
    const state = getState() as { posts: PostsState };
    const post = state.posts.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const updatedComments = post.comments.map(c =>
      c.id === commentId && c.userId === userId ? { ...c, body } : c
    );

    const updatedPost = { ...post, comments: updatedComments };

    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost),
    });
    return await response.json();
  }
);

// Delete a comment
export const deleteCommentAsync = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId, userId }: { postId: string; commentId: string; userId: string }, { getState }) => {
    const state = getState() as { posts: PostsState };
    const post = state.posts.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const updatedComments = post.comments.filter(c => !(c.id === commentId && c.userId === userId));
    const updatedPost = { ...post, comments: updatedComments };

    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost),
    });
    return await response.json();
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<'newest' | 'oldest' | 'most-comments'>) => {
      state.sortBy = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      // Update post
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      // Delete post
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload);
      })
      // Add comment
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      // Update comment
      .addCase(updateCommentAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      // Delete comment
      .addCase(deleteCommentAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      });
  },
});

export const {
  setSortBy,
  setSearchQuery,
} = postsSlice.actions;
export default postsSlice.reducer;
