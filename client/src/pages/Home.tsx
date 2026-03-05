import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchPosts, createPost, deletePostAsync, updatePostAsync, setSortBy, setSearchQuery } from '../store/postsSlice';
import { logout } from '../store/authSlice';
import { fetchUsers } from '../store/usersSlice';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';

const Home = () => {
  const dispatch = useAppDispatch();
  const { posts, loading, sortBy, searchQuery } = useAppSelector(state => state.posts);
  const { currentUser, isAuthenticated } = useAppSelector(state => state.auth);
  const { users } = useAppSelector(state => state.users);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Assign usernames to posts
  const postsWithUsernames = posts.map(post => {
    if (!post.username) {
      const user = users.find(u => u.id === post.userId);
      return { ...post, username: user?.username || 'Unknown' };
    }
    return post;
  });

  // Filter and sort posts
  const filteredPosts = postsWithUsernames
    .filter(post => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.body.toLowerCase().includes(query) ||
        post.username.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-comments':
          return b.comments.length - a.comments.length;
        default:
          return 0;
      }
    });

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleDeletePost = (postId: string) => {
    if (currentUser) {
      dispatch(deletePostAsync({ id: postId, userId: currentUser.id }));
    }
  };

  const handleUpdatePost = (postId: string, title: string, body: string) => {
    if (currentUser) {
      dispatch(updatePostAsync({ id: postId, title, body, userId: currentUser.id }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Feed App</h1>
          {isAuthenticated && currentUser && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {currentUser.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and Sort */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value as 'newest' | 'oldest' | 'most-comments'))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-comments">Most Comments</option>
          </select>
        </div>

        {/* Create Post Button */}
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors mb-6"
          >
            + Create New Post
          </button>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No posts found</div>
          ) : (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id || ''}
                onDelete={handleDeletePost}
                onUpdate={handleUpdatePost}
              />
            ))
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreateModal && currentUser && (
        <CreatePost
          userId={currentUser.id}
          username={currentUser.username}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
