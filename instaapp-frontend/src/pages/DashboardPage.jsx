import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import API from "../api/axios";
import moment from "moment";
import CreatePostModal from "../components/CreatePostModal";

const DashboardPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const hasMore = useRef(true);
  const isFetching = useRef(false);
  const navigate = useNavigate();
  const [expandedComments, setExpandedComments] = useState({});
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchPosts();
  });

  //Cek Autentikasi
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")); // Ambil user dari sessionStorage

    if (!token) {
      setTimeout(() => navigate("/"), 100); // Beri jeda sebelum redirect
    } else {
      setActiveUserId(loggedInUser?.id); // Simpan user_id ke state
    }
  }, [navigate]);

  const fetchPosts = useCallback(async () => {
    if (isFetching.current || !hasMore.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const response = await API.get(`/posts?page=${page}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
      });

      if (!response.data || !Array.isArray(response.data.posts)) {
        throw new Error("Invalid API response: posts is missing or not an array");
      }

      if (response.data.posts.length === 0) {
        hasMore.current = false;
      } else {
        const postsWithComments = response.data.posts.map((post) => ({
          ...post,
          comments: post.comments || [],
        }));

        setPosts((prev) => [...prev, ...postsWithComments]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching posts:", error.response?.data || error.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        console.log("load more");

        fetchPosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts, loading]);

  const handleLike = async (postId) => {
    try {
      const post = posts.find((p) => p.id === postId);
      const isLiked = post.likes.map((like) => like.user_id).includes(activeUserId); //  Perbaikan di sini

      await API.post(`/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` } });

      if (isLiked) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: p.likes.filter((like) => like.user_id !== activeUserId) } : p)));
      } else {
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: [...p.likes, { user_id: activeUserId }] } : p)));
      }
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Failed to like/unlike post",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const toggleShowMoreComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const submitComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const response = await API.post(`/comments/${postId}/comment`, { content: commentText }, { headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` } });

      const newComment = response.data.comment;

      setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post)));

      setCommentText("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to add comment",
        text: error.response?.data?.message || "Something went wrong. Please try again.",
      });
    }
  };

  const submitReply = async (commentId, postId) => {
    if (!replyText.trim()) return;

    try {
      const response = await API.post(`/comments/${commentId}/reply`, { content: replyText }, { headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` } });

      const newReply = response.data.reply;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) => (comment.id === commentId ? { ...comment, replies: [...(comment.replies || []), newReply] } : comment)),
              }
            : post
        )
      );

      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to reply",
        text: error.response?.data?.message || "Something went wrong. Please try again.",
      });
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await API.delete(`/comments/${postId}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
      });

      setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) } : post)));
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Gagal hapus komentar",
        text: "Terjadi Kesalahan,silakan coba lagi.",
      });
    }
  };

  //  Logout
  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  const handleAddPost = async (caption, file) => {
    if (!caption || !file) {
      alert("Please add an image and caption!");
      return;
    }

    const formData = new FormData();
    formData.append("content", caption);
    formData.append("image", file);

    try {
      const response = await API.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPosts([response.data.post, ...posts]);
      setShowCreatePost(false);
    } catch (error) {
      console.log(error);

      Swal.fire("Error!", "Failed to create post.", "error");
    }
  };

  const deletePost = async (postId) => {
    Swal.fire({
      title: "Apa kamu yakin?",
      text: "Postingan ini akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, lanjutkan!",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/posts/${postId}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
          });
          setPosts(posts.filter((post) => post.id !== postId));
          Swal.fire("Deleted!", "Your post has been deleted.", "success");
        } catch (error) {
          console.log(error);

          Swal.fire("Error!", "Failed to delete post.", "error");
        }
      }
    });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
            Logout
          </button>
        </div>

        <button onClick={() => setShowCreatePost(!showCreatePost)} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium mb-4 transition">
          {showCreatePost ? "Cancel" : "Create Post"}
        </button>

        {showCreatePost && <CreatePostModal isOpen={showCreatePost} handleAddPost={handleAddPost} closeModal={() => setShowCreatePost(false)} />}

        <div className="space-y-6">
          {posts.map((post) => {
            const isExpanded = expandedComments[post.id];
            const commentsToShow = isExpanded ? post.comments : post.comments.slice(0, 5);

            return (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">
                    {post.user.username}
                    <br />
                    <small className="text-gray-400">{moment(post.created_at).fromNow()}</small>
                  </h3>
                </div>

                {post.user.id === activeUserId && (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="absolute top-3 right-3 bg-gray-500 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium shadow flex items-center space-x-2 transition duration-300"
                  >
                    <FaTrash className="text-white text-sm" />
                  </button>
                )}

                <p className="text-gray-700 mb-4">{post.content}</p>
                {post.image && <img src={post.image} alt="Post" className="w-full rounded-lg mb-4" />}

                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => handleLike(post.id)} className="text-blue-500 hover:text-blue-700 font-medium">
                    <b>{post.likes.map((like) => like.user_id).includes(activeUserId) ? `Unlike` : `Like`}</b>
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 font-medium" onClick={() => setActivePostId(post.id === activePostId ? null : post.id)}>
                    Likes ({post.likes.length}) &nbsp; Comments ({post.comments.length})
                  </button>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <input type="text" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1 p-2 border rounded-md" />
                  <button onClick={() => submitComment(post.id)} className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    Post
                  </button>
                </div>

                {activePostId === post.id && (
                  <div className="bg-gray-50 p-3 rounded-lg mt-3 shadow-md">
                    <h4 className="font-semibold text-gray-700 mb-2">Comments:</h4>

                    {commentsToShow.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {commentsToShow.map((comment, index) => (
                          <div key={index} className="p-2 bg-white rounded-md shadow-sm">
                            <div className="flex justify-between items-center">
                              <p className="text-gray-600 text-sm">
                                <strong>{comment.user?.username || "Anonymous"}:</strong> {comment.content}
                              </p>

                              {comment.user?.id === activeUserId && (
                                <button onClick={() => deleteComment(post.id, comment.id)} className="text-red-500 hover:text-red-700 text-xs">
                                  Delete
                                </button>
                              )}
                            </div>

                            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-blue-500 hover:text-blue-700 text-xs mt-1">
                              {replyingTo === comment.id ? "Cancel" : "Reply"}
                            </button>

                            {replyingTo === comment.id && (
                              <div className="mt-2">
                                <input type="text" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-2 border rounded-md" />
                                <button onClick={() => submitReply(post.id, comment.id)} className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2">
                                  Reply
                                </button>
                              </div>
                            )}

                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-5 mt-2 border-l-2 border-gray-300 pl-3">
                                {comment.replies.map((reply, index) => (
                                  <div key={index} className="p-2 bg-gray-100 rounded-md shadow-sm">
                                    <p className="text-gray-600 text-sm">
                                      <strong>{reply.user?.username || "Anonymous"}:</strong> {reply.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet.</p>
                    )}

                    {post.comments.length > 10 && (
                      <button onClick={() => toggleShowMoreComments(post.id)} className="text-blue-500 hover:text-blue-700 font-medium mt-2 block">
                        {isExpanded ? "Show Less" : "Show More Comments"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && <p className="text-center text-gray-500 font-medium">Loading...</p>}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
