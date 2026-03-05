export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  body: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  title: string;
  body: string;
  createdAt: string;
  comments: Comment[];
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

export interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  sortBy: 'newest' | 'oldest' | 'most-comments';
  searchQuery: string;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}
