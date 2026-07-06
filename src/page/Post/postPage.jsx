import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // استيراد خطاف الترجمة
import RightBar from '../../components/rightBar/rightBar';
import { useAuth } from '../../context/Auth'; 
import NavBar from '../../components/navBar/PageHeade';
import { 
  FaCheckCircle, 
  FaRegHeart, 
  FaHeart, 
  FaRegComment, 
  FaPaperclip, 
  FaPaperPlane,
  FaBorderAll,
  FaUserShield,
  FaImage,
  FaTimes,
  FaDownload,
  FaTrash,
  FaUndo
} from 'react-icons/fa';
import './PostsPage.css';

export default function PostsPage() {
  const { t, i18n } = useTranslation('postsPage'); // الالتزام باسم الملف postsPage
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [newPostText, setNewPostText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // حالات تتبع طلبات الحذف في نفس المكان (In-line Confirmation States)
  const [postToDelete, setPostToDelete] = useState(null); 
  const [commentToDelete, setCommentToDelete] = useState(null); 

  // نظام التنبيهات الاحترافي البديل للـ alert
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const [expandedComments, setExpandedComments] = useState({});
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  const { user } = useAuth();
  const token = localStorage.getItem('token'); 
  
  const currentUserId = user ? String(user.id || user._id || user.sub || '') : '';
  const currentUserRole = user ? user.role : '';

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchPosts();
    if (user && user.role) {
      const roleText = user.role === 'admin' ? t('notifications.role_admin') : t('notifications.role_user');
      showNotification(`${t('notifications.welcome')}! ${t('notifications.current_role')}: ${roleText}`, 'success');
    }
  }, [user, t]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('https://ahmedpr5002-irs-hvtl.hf.space/user/all');
      const safePosts = response.data.map(p => ({
        ...p,
        likes: p.likes || [],
        comments: p.comments || []
      }));
      setPosts(safePosts);
      setLoadingPosts(false);
    } catch (error) {
      showNotification(t('notifications.fetch_error'), "error");
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return showNotification(t('notifications.empty_post_error'), "error");

    const formData = new FormData();
    formData.append('content', newPostText);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      await axios.post('https://ahmedpr5002-irs-hvtl.hf.space/user/create', formData, {
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
      });
      showNotification(t('notifications.post_success'), "success");
      setNewPostText('');
      setSelectedFile(null);
      fetchPosts(); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || t('notifications.server_connect_error');
      showNotification(`${t('notifications.post_fail_prefix')}: ${errorMsg}`, "error");
    }
  };

  const executeDeletePost = async (postId) => {
    try {
      await axios.delete(`https://ahmedpr5002-irs-hvtl.hf.space/user/${postId}`, config);
      showNotification(t('notifications.delete_post_success'), "success");
      setPosts(prev => prev.filter(post => post._id !== postId));
      setPostToDelete(null); 
    } catch (error) {
      showNotification(t('notifications.delete_post_fail'), "error");
    }
  };

  const executeDeleteComment = async (postId, commentId) => {
    try {
      const response = await axios.delete(`https://ahmedpr5002-irs-hvtl.hf.space/user/${postId}/comment/${commentId}`, config);
      showNotification(t('notifications.delete_comment_success'), "success");
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return { ...post, comments: response.data.comments };
        }
        return post;
      }));
      setCommentToDelete(null); 
    } catch (error) {
      showNotification(t('notifications.delete_comment_fail'), "error");
    }
  };

  const handleLike = async (postId) => {
    if (!token || !currentUserId) {
      return showNotification(t('notifications.login_required_like'), "error");
    }

    try {
      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          const likesArr = post.likes || [];
          const isLiked = likesArr.some(id => String(typeof id === 'object' ? (id._id || id.id) : id) === currentUserId);

          return {
            ...post,
            likes: isLiked 
              ? likesArr.filter(id => String(typeof id === 'object' ? (id._id || id.id) : id) !== currentUserId) 
              : [...likesArr, currentUserId]
          };
        }
        return post;
      }));

      await axios.put(`https://ahmedpr5002-irs-hvtl.hf.space/user/${postId}/like`, {}, config);
    } catch (error) {
      console.error(error);
      fetchPosts(); 
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    try {
      const response = await axios.post(`https://ahmedpr5002-irs-hvtl.hf.space/user/${postId}/comment`, { text: commentText }, config);
      setCommentInputs(prev => ({ ...prev, [postId]: '' })); 
      showNotification(t('notifications.comment_success'), "success");
      
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return { ...post, comments: response.data.comments };
        }
        return post;
      }));
    } catch (error) {
      showNotification(t('notifications.comment_fail'), "error");
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const downloadImage = async (imgUrl) => {
    try {
      showNotification(t('notifications.preparing_download'), "success");
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HQ-Post-Image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showNotification(t('notifications.download_fail'), "error");
    }
  };

  const filteredPosts = posts.filter(post => {
    const postUser = post.user || post.author;
    const isPostAdmin = typeof postUser === 'object' ? postUser?.role === 'admin' : (postUser === currentUserId && currentUserRole === 'admin');
    if (activeFilter === 'admin') return isPostAdmin;
    if (activeFilter === 'photos') return !!post.image;
    return true;
  });

  const currentDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  if (loadingPosts) return <div className="posts-loading">{t('status.loading')}</div>;

  return (
    <div className="posts-container-layout" dir={currentDir}>
      <NavBar title={t('nav.title')} subtitle={t('nav.subtitle')}/>
      <RightBar/>
      
      {toast.show && <div className={`custom-toast dynamic-toast-animation ${toast.type}`}>{toast.message}</div>}
      
      {activeLightboxImg && (
        <div className="luxury-lightbox-overlay" onClick={() => setActiveLightboxImg(null)}>
          <div className="lightbox-wrapper-card" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-circle" onClick={() => setActiveLightboxImg(null)} title={t('lightbox.close_hint')}>
              <FaTimes />
            </button>
            <div className="lightbox-image-frame">
              <img src={activeLightboxImg} alt="Preview HQ" className="lightbox-img-render" />
            </div>
            <div className="lightbox-bottom-panel">
              <span className="lightbox-img-info">{t('lightbox.preview_title')}</span>
              <button className="lightbox-action-download-btn" onClick={() => downloadImage(activeLightboxImg)}>
                <FaDownload /> {t('lightbox.download_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="segmented-filters-container">
        <div className="segmented-control">
          <button type="button" className={`segmented-item ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}><FaBorderAll className="filter-icon" /> <span>{t('filters.all')}</span></button>
          <button type="button" className={`segmented-item ${activeFilter === 'admin' ? 'active' : ''}`} onClick={() => setActiveFilter('admin')}><FaUserShield className="filter-icon" /> <span>{t('filters.admin')}</span></button>
          <button type="button" className={`segmented-item ${activeFilter === 'photos' ? 'active' : ''}`} onClick={() => setActiveFilter('photos')}><FaImage className="filter-icon" /> <span>{t('filters.photos')}</span></button>
        </div>
      </div>

      <form onSubmit={handleCreatePost} className="create-post-card">
        <textarea placeholder={t('create_post.placeholder')} value={newPostText} onChange={(e) => setNewPostText(e.target.value)} />
        {selectedFile && <div className="selected-file-badge">{t('create_post.image_selected')}: {selectedFile.name.substring(0, 20)}...</div>}
        <div className="create-post-actions">
          <label className="upload-img-btn-modern">
            <FaPaperclip className="btn-icon-inside" /> {t('create_post.attach_btn')}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
          </label>
          <button type="submit" className="submit-post-btn-modern">{t('create_post.submit_btn')}</button>
        </div>
      </form>

      <div className="posts-list">
        {filteredPosts.map(post => {
          const postUser = post.user || post.author; 
          const postCreatorId = typeof postUser === 'object' ? String(postUser?._id || postUser?.id) : String(postUser);
          
          const hasLiked = currentUserId && post.likes && post.likes.some(id => String(typeof id === 'object' ? (id._id || id.id) : id) === currentUserId);
          const isCreatorAdmin = typeof postUser === 'object' ? postUser?.role === 'admin' : (postCreatorId === currentUserId && currentUserRole === 'admin');
          const isCommentsOpen = !!expandedComments[post._id];

          const canDeletePost = postCreatorId === currentUserId || currentUserRole === 'admin';

          return (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <img src={typeof postUser === 'object' ? postUser?.image : (postCreatorId === currentUserId ? user?.image : 'https://via.placeholder.com/40')} alt="Avatar" className="user-avatar" />
                <div className="user-info">
                  <h4 className="username">
                    {typeof postUser === 'object' ? postUser?.username : (postCreatorId === currentUserId ? user?.username : t('post_card.anonymous_user'))}
                    {isCreatorAdmin && <span className="verified-wrapper"><FaCheckCircle className="verified-badge-real" /></span>}
                  </h4>
                  <span className="post-date">{new Date(post.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* نظام التحكم التأكيدي الذكي للمنشور */}
                {canDeletePost && (
                  <div className="inline-action-zone">
                    {postToDelete === post._id ? (
                      <div className="modern-inline-confirm modern-inline-confirm-dir-support animate-pop">
                        <button type="button" className="confirm-yes-btn" onClick={() => executeDeletePost(post._id)}>{t('actions.delete')}</button>
                        <button type="button" className="confirm-no-btn" onClick={() => setPostToDelete(null)}><FaUndo /></button>
                      </div>
                    ) : (
                      <button type="button" className="delete-post-btn" onClick={() => setPostToDelete(post._id)} title={t('actions.delete_post_hint')}>
                        <FaTrash />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="post-body">
                <p className="post-text">{post.content}</p>
                {post.image && (
                  <div className="post-img-wrapper" onClick={() => setActiveLightboxImg(post.image)}>
                    <img src={post.image} alt="Post Attachment" className="post-attached-img" />
                    <div className="img-overlay-hint">{t('post_card.view_image')}</div>
                  </div>
                )}
              </div>

              <div className="post-stats">
                <span>{post.likes?.length || 0} {t('post_card.likes_count')}</span>
                <span className="comments-stat-btn" onClick={() => toggleComments(post._id)}>{post.comments?.length || 0} {t('post_card.comments_count')}</span>
              </div>

              <div className="post-actions">
                <button type="button" className={`action-btn-modern ${hasLiked ? 'liked-active-btn' : ''}`} onClick={() => handleLike(post._id)}>
                  {hasLiked ? <FaHeart className="action-icon liked-icon-pop" /> : <FaRegHeart className="action-icon" />}
                  <span>{hasLiked ? t('actions.liked') : t('actions.like')}</span>
                </button>
                <button type="button" className={`action-btn-modern ${isCommentsOpen ? 'comments-active-btn' : ''}`} onClick={() => toggleComments(post._id)}>
                  <FaRegComment className="action-icon" /> <span>{t('actions.comment')}</span>
                </button>
              </div>

              {isCommentsOpen && (
                <div className="comments-section">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map(comment => {
                      const commentUser = comment.user || comment.author;
                      const commentCreatorId = typeof commentUser === 'object' ? String(commentUser?._id || commentUser?.id) : String(commentUser);
                      const isCommenterAdmin = typeof commentUser === 'object' ? commentUser?.role === 'admin' : (commentCreatorId === currentUserId && currentUserRole === 'admin');
                      
                      const canDeleteComment = commentCreatorId === currentUserId || currentUserRole === 'admin';

                      return (
                        <div key={comment._id} className="comment-item">
                          <img src={typeof commentUser === 'object' ? commentUser?.image : (commentCreatorId === currentUserId ? user?.image : 'https://via.placeholder.com/30')} alt="Avatar" className="comment-avatar" />
                          <div className="comment-content">
                            <h5 className="comment-username">
                              {typeof commentUser === 'object' ? commentUser?.username : (commentCreatorId === currentUserId ? user?.username : t('post_card.commenter_fallback'))}
                              {isCommenterAdmin && <FaCheckCircle className="verified-badge-real comment-badge" />}
                            </h5>
                            <p>{comment.text}</p>
                          </div>

                          {/* نظام التحكم التأكيدي الذكي للتعليق */}
                          {canDeleteComment && (
                            <div className="inline-action-zone">
                              {commentToDelete === comment._id ? (
                                <div className="modern-inline-confirm comment-confirm animate-pop">
                                  <button type="button" className="confirm-yes-btn tiny" onClick={() => executeDeleteComment(post._id, comment._id)}>{t('actions.delete')}</button>
                                  <button type="button" className="confirm-no-btn tiny" onClick={() => setCommentToDelete(null)}><FaUndo /></button>
                                </div>
                              ) : (
                                <button type="button" className="delete-comment-btn" onClick={() => setCommentToDelete(comment._id)} title={t('actions.delete_comment_hint')}>
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-comments-hint">{t('post_card.no_comments')}</div>
                  )}
                  
                  <div className="add-comment-box">
                    <input 
                      type="text" 
                      placeholder={t('post_card.comment_placeholder')} 
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                    />
                    <button type="button" className="send-comment-btn-modern" onClick={() => handleAddComment(post._id)}><FaPaperPlane style={{ transform: i18n.language === 'en' ? 'rotate(180deg)' : 'none' }} /></button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}