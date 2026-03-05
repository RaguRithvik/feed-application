import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addCommentAsync, updateCommentAsync, deleteCommentAsync } from '../store/postsSlice';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onDelete: (postId: string) => void;
  onUpdate: (postId: string, title: string, body: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onDelete, onUpdate }) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(state => state.users.users);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentBody, setEditCommentBody] = useState('');

  const isOwner = post.userId === currentUserId;

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUserId) return;
    
    const user = users.find(u => u.id === currentUserId);
    dispatch(addCommentAsync({
      postId: post.id,
      userId: currentUserId,
      username: user?.username || 'Unknown',
      body: newComment,
    }));
    setNewComment('');
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editCommentBody.trim()) return;
    dispatch(updateCommentAsync({
      postId: post.id,
      commentId,
      body: editCommentBody,
      userId: currentUserId,
    }));
    setEditingCommentId(null);
    setEditCommentBody('');
  };

  const handleDeleteComment = (commentId: string) => {
    dispatch(deleteCommentAsync({
      postId: post.id,
      commentId,
      userId: currentUserId,
    }));
  };

  const handleSaveEdit = () => {
    onUpdate(post.id, editTitle, editBody);
    setEditingPost(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Post Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          {editingPost ? (
            <div className="w-full">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingPost(false)}
                  className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
              <p className="text-sm text-gray-500">@{post.username}</p>
            </>
          )}
        </div>
        {isOwner && !editingPost && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditingPost(true)}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Post Body */}
      {!editingPost && (
        <p className="text-gray-700 mb-4">{post.body}</p>
      )}

      {/* Comments Section */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showComments ? 'Hide Comments' : `Show Comments (${post.comments.length})`}
        </button>

        {showComments && (
          <div className="mt-4">
            {/* Add Comment */}
            {currentUserId && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Post
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {post.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                  {editingCommentId === comment.id ? (
                    <div>
                      <textarea
                        value={editCommentBody}
                        onChange={(e) => setEditCommentBody(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-gray-800">@{comment.username}</span>
                          <p className="text-gray-700">{comment.body}</p>
                        </div>
                        {comment.userId === currentUserId && (
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditCommentBody(comment.body);
                              }}
                              className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
