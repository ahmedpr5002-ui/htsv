import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RightBar from '../../components/rightBar/rightBar';
import { useAuth } from '../../context/Auth'; 
import NavBar from '../../components/navBar/PageHeade'
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
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [newPostText, setNewPostText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // حالات تتبع طلبات الحذف في نفس المكان (In-line Confirmation States)
  const [postToDelete, setPostToDelete] = useState(null); // تخزين ID المنشور المراد حذفه
  const [commentToDelete, setCommentToDelete] = useState(null); // تخزين ID التعليق المراد حذفه

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
      showNotification(`مرحباً بك! رتبتك الحالية في النظام: ${user.role === 'admin' ? 'إدارة المنصة' : 'مستخدم'}`, 'success');
    }
  }, [user]);

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
      showNotification("خطأ في جلب المنشورات من السيرفر", "error");
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return showNotification("يرجى كتابة نص المنشور أولاً", "error");

    const formData = new FormData();
    formData.append('content', newPostText);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      await axios.post('https://ahmedpr5002-irs-hvtl.hf.space/user/create', formData, {
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
      });
      showNotification("تم النشر بنجاح شكرا لمشاركة المعرفة", "success");
      setNewPostText('');
      setSelectedFile(null);
      fetchPosts(); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || "فشل الاتصال بالسيرفر";
      showNotification(`خطأ أثناء النشر: ${errorMsg}`, "error");
    }
  };

  // معالجة الحذف الفوري النهائي للمنشور
  const executeDeletePost = async (postId) => {
    try {
      await axios.delete(`https://ahmedpr5002-irs-hvtl.hf.space/user/${postId}`, config);
      showNotification("تم حذف المنشور بنجاح", "success");
      setPosts(prev => prev.filter(post => post._id !== postId));
      setPostToDelete(null); // تصفير الحالة
    } catch (error) {
      showNotification("فشل في حذف المنشور", "error");
    }
  };

  // معالجة الحذف الفوري النهائي للتعليق
  const executeDeleteComment = async (postId, commentId) => {
    try {
      const response = await axios.delete(`https://ahmedpr5002-irs-hvtl.hf.space/user/${postId}/comment/${commentId}`, config);
      showNotification("تم إزالة التعليق بنجاح", "success");
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return { ...post, comments: response.data.comments };
        }
        return post;
      }));
      setCommentToDelete(null); // تصفير الحالة
    } catch (error) {
      showNotification("فشل في حذف التعليق", "error");
    }
  };

  const handleLike = async (postId) => {
    if (!token || !currentUserId) {
      return showNotification("يرجى تسجيل الدخول أولاً للتفاعل مع المنشورات", "error");
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
      showNotification("تم نشر تعليقك بنجاح", "success");
      
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return { ...post, comments: response.data.comments };
        }
        return post;
      }));
    } catch (error) {
      showNotification("فشل إضافة التعليق", "error");
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const downloadImage = async (imgUrl) => {
    try {
      showNotification("جاري تجهيز الصورة للتحميل الفوري...", "success");
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
      showNotification("فشل تحميل الصورة تلقائياً، يمكنك حفظها عبر الضغط المطول عليها", "error");
    }
  };

  const filteredPosts = posts.filter(post => {
    const postUser = post.user || post.author;
    const isPostAdmin = typeof postUser === 'object' ? postUser?.role === 'admin' : (postUser === currentUserId && currentUserRole === 'admin');
    if (activeFilter === 'admin') return isPostAdmin;
    if (activeFilter === 'photos') return !!post.image;
    return true;
  });

  if (loadingPosts) return <div className="posts-loading">جاري المزامنة وجلب المنشورات...</div>;

  return (
    <div className="posts-container-layout">
        <NavBar title='قاعدة المعرفة' subtitle='شارك رأيك وتجربتك ومعلومتك'/>
        <RightBar/>
      
      {toast.show && <div className={`custom-toast dynamic-toast-animation ${toast.type}`}>{toast.message}</div>}
      
      {activeLightboxImg && (
        <div className="luxury-lightbox-overlay" onClick={() => setActiveLightboxImg(null)}>
          <div className="lightbox-wrapper-card" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-circle" onClick={() => setActiveLightboxImg(null)} title="إغلاق العرض">
              <FaTimes />
            </button>
            <div className="lightbox-image-frame">
              <img src={activeLightboxImg} alt="Preview HQ" className="lightbox-img-render" />
            </div>
            <div className="lightbox-bottom-panel">
              <span className="lightbox-img-info">معاينة الصورة بدقة كاملة</span>
              <button className="lightbox-action-download-btn" onClick={() => downloadImage(activeLightboxImg)}>
                <FaDownload /> حفظ واستخراج الصورة الآن
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="segmented-filters-container">
        <div className="segmented-control">
          <button type="button" className={`segmented-item ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}><FaBorderAll className="filter-icon" /> <span>كل المنشورات</span></button>
          <button type="button" className={`segmented-item ${activeFilter === 'admin' ? 'active' : ''}`} onClick={() => setActiveFilter('admin')}><FaUserShield className="filter-icon" /> <span>منشورات الإدارة</span></button>
          <button type="button" className={`segmented-item ${activeFilter === 'photos' ? 'active' : ''}`} onClick={() => setActiveFilter('photos')}><FaImage className="filter-icon" /> <span>منشورات بصور</span></button>
        </div>
      </div>

      <form onSubmit={handleCreatePost} className="create-post-card">
        <textarea placeholder="بماذا تفكر اليوم؟ شارك المستجدات مع زملائك..." value={newPostText} onChange={(e) => setNewPostText(e.target.value)} />
        {selectedFile && <div className="selected-file-badge">تم تحديد صورة: {selectedFile.name.substring(0, 20)}...</div>}
        <div className="create-post-actions">
          <label className="upload-img-btn-modern">
            <FaPaperclip className="btn-icon-inside" /> إرفاق صورة بالمنشور
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
          </label>
          <button type="submit" className="submit-post-btn-modern">نشر الآن</button>
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
                    {typeof postUser === 'object' ? postUser?.username : (postCreatorId === currentUserId ? user?.username : "مستخدم مجهول")}
                    {isCreatorAdmin && <span className="verified-wrapper"><FaCheckCircle className="verified-badge-real" /></span>}
                  </h4>
                  <span className="post-date">{new Date(post.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* نظام التحكم التأكيدي الذكي الجديد للمنشور */}
                {canDeletePost && (
                  <div className="inline-action-zone">
                    {postToDelete === post._id ? (
                      <div className="modern-inline-confirm animate-pop">
                        <button type="button" className="confirm-yes-btn" onClick={() => executeDeletePost(post._id)}>احذف</button>
                        <button type="button" className="confirm-no-btn" onClick={() => setPostToDelete(null)}><FaUndo /></button>
                      </div>
                    ) : (
                      <button type="button" className="delete-post-btn" onClick={() => setPostToDelete(post._id)} title="طلب حذف المنشور">
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
                    <div className="img-overlay-hint">عرض الصورة</div>
                  </div>
                )}
              </div>

              <div className="post-stats">
                <span>{post.likes?.length || 0} إعجاب</span>
                <span className="comments-stat-btn" onClick={() => toggleComments(post._id)}>{post.comments?.length || 0} تعليق</span>
              </div>

              <div className="post-actions">
                <button type="button" className={`action-btn-modern ${hasLiked ? 'liked-active-btn' : ''}`} onClick={() => handleLike(post._id)}>
                  {hasLiked ? <FaHeart className="action-icon liked-icon-pop" /> : <FaRegHeart className="action-icon" />}
                  <span>{hasLiked ? 'أعجبتني' : 'إعجاب'}</span>
                </button>
                <button type="button" className={`action-btn-modern ${isCommentsOpen ? 'comments-active-btn' : ''}`} onClick={() => toggleComments(post._id)}>
                  <FaRegComment className="action-icon" /> <span>تعليق</span>
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
                              {typeof commentUser === 'object' ? commentUser?.username : (commentCreatorId === currentUserId ? user?.username : "مستخدم")}
                              {isCommenterAdmin && <FaCheckCircle className="verified-badge-real comment-badge" />}
                            </h5>
                            <p>{comment.text}</p>
                          </div>

                          {/* نظام التحكم التأكيدي الذكي للتعليق */}
                          {canDeleteComment && (
                            <div className="inline-action-zone">
                              {commentToDelete === comment._id ? (
                                <div className="modern-inline-confirm comment-confirm animate-pop">
                                  <button type="button" className="confirm-yes-btn tiny" onClick={() => executeDeleteComment(post._id, comment._id)}>احذف</button>
                                  <button type="button" className="confirm-no-btn tiny" onClick={() => setCommentToDelete(null)}><FaUndo /></button>
                                </div>
                              ) : (
                                <button type="button" className="delete-comment-btn" onClick={() => setCommentToDelete(comment._id)} title="طلب حذف التعليق">
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-comments-hint">لا توجد تعليقات بعد، كن أول من يعلق!</div>
                  )}
                  
                  <div className="add-comment-box">
                    <input 
                      type="text" 
                      placeholder="اكتب تعليقاً..." 
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                    />
                    <button type="button" className="send-comment-btn-modern" onClick={() => handleAddComment(post._id)}><FaPaperPlane /></button>
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