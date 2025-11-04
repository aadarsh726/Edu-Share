import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Collapse, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Chat, Send, Heart, HeartFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const PostCard = ({ post: initialPost, onCommentAdded, showToast }) => {
    // Local state for post to handle optimistic updates
    const [post, setPost] = useState(initialPost);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');
    const [loadingUsername, setLoadingUsername] = useState(false);
    const [likingPost, setLikingPost] = useState(false);
    const [likingComments, setLikingComments] = useState({}); // Track which comment is being liked
    const { auth } = useContext(AuthContext);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState('');
    const [summarizing, setSummarizing] = useState(false);

    // Update local post state when prop changes
    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    // Fetch current user's username when component mounts (if authenticated)
    useEffect(() => {
        const fetchCurrentUsername = async () => {
            if (auth.isAuthenticated && auth.user?.id && !currentUsername) {
                try {
                    setLoadingUsername(true);
                    const response = await api.get(`/users/${auth.user.id}`);
                    if (response.data?.user?.username) {
                        setCurrentUsername(response.data.user.username);
                    }
                } catch (err) {
                    console.error('Failed to fetch username:', err);
                } finally {
                    setLoadingUsername(false);
                }
            }
        };

        fetchCurrentUsername();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.isAuthenticated, auth.user?.id]);

    const handleToggleComments = () => {
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        
        if (!commentText.trim() || !auth.isAuthenticated || !currentUsername) {
            if (!currentUsername) {
                showToast && showToast('error', 'Failed to load user information. Please refresh the page.');
            }
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post(
                `/comments/${post._id}`,
                { text: commentText, username: currentUsername }
            );

            // Update local state immediately
            setPost(response.data);
            // Update parent component
            onCommentAdded && onCommentAdded(response.data);
            setCommentText('');
            showToast && showToast('success', 'Comment added successfully!');
        } catch (err) {
            console.error('Failed to add comment:', err);
            showToast && showToast('error', 'Failed to add comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Check if current user has liked the post
    const isPostLiked = () => {
        if (!auth.isAuthenticated || !auth.user?.id || !post.likes) {
            return false;
        }
        return post.likes.some(likeId => {
            const id = typeof likeId === 'object' ? likeId._id : likeId;
            return id === auth.user.id;
        });
    };

    // Get post like count
    const getPostLikeCount = () => {
        return post.likes ? post.likes.length : 0;
    };

    // Handle post like/unlike toggle
    const handlePostLikeToggle = async () => {
        if (!auth.isAuthenticated) {
            showToast && showToast('error', 'Please log in to like posts.');
            return;
        }

        const isLiked = isPostLiked();

        try {
            setLikingPost(true);
            
            // Optimistic update - update UI immediately
            const updatedLikes = isLiked 
                ? (post.likes || []).filter(likeId => {
                    const id = typeof likeId === 'object' ? likeId._id : likeId;
                    return id !== auth.user.id;
                })
                : [...(post.likes || []), auth.user.id];
            
            setPost({ ...post, likes: updatedLikes });

            const endpoint = isLiked ? `/posts/${post._id}/unlike` : `/posts/${post._id}/like`;
            const response = await api.post(
                endpoint,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Update with server response
            setPost(response.data.post);
            // Update parent component
            onCommentAdded && onCommentAdded(response.data.post);
        } catch (err) {
            console.error('Failed to toggle post like:', err);
            // Revert optimistic update on error
            setPost(initialPost);
            showToast && showToast('error', err.response?.data?.msg || 'Failed to update like. Please try again.');
        } finally {
            setLikingPost(false);
        }
    };

    // Check if current user has liked a comment
    const isCommentLiked = (comment) => {
        if (!auth.isAuthenticated || !auth.user?.id || !comment.likes) {
            return false;
        }
        return comment.likes.some(likeId => {
            const id = typeof likeId === 'object' ? likeId._id : likeId;
            return id === auth.user.id;
        });
    };

    // Get comment like count
    const getCommentLikeCount = (comment) => {
        return comment.likes ? comment.likes.length : 0;
    };

    // Handle comment like/unlike toggle
    const handleCommentLikeToggle = async (comment) => {
        if (!auth.isAuthenticated) {
            showToast && showToast('error', 'Please log in to like comments.');
            return;
        }

        const isLiked = isCommentLiked(comment);
        const commentKey = comment.createdAt;

        try {
            setLikingComments(prev => ({ ...prev, [commentKey]: true }));
            
            // Optimistic update
            const updatedComments = post.comments.map(c => {
                if (c.createdAt === comment.createdAt) {
                    const updatedLikes = isLiked
                        ? (c.likes || []).filter(likeId => {
                            const id = typeof likeId === 'object' ? likeId._id : likeId;
                            return id !== auth.user.id;
                        })
                        : [...(c.likes || []), auth.user.id];
                    return { ...c, likes: updatedLikes };
                }
                return c;
            });
            setPost({ ...post, comments: updatedComments });

            const endpoint = isLiked 
                ? `/comments/${post._id}/unlike` 
                : `/comments/${post._id}/like`;
            const response = await api.post(
                endpoint,
                { commentCreatedAt: comment.createdAt },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Update with server response
            setPost(response.data.post);
            // Update parent component
            onCommentAdded && onCommentAdded(response.data.post);
        } catch (err) {
            console.error('Failed to toggle comment like:', err);
            // Revert optimistic update on error
            setPost(initialPost);
            showToast && showToast('error', err.response?.data?.msg || 'Failed to update like. Please try again.');
        } finally {
            setLikingComments(prev => ({ ...prev, [commentKey]: false }));
        }
    };

    return (
        <Card bg="dark" text="white" className="mb-3 shadow-lg border-secondary">
            <Card.Body>
                <Card.Subtitle className="mb-2 text-white-50">
                    <Link to={`/profile/${post.author._id}`} className="text-white text-decoration-none">
                        <strong>@{post.author.username}</strong>
                    </Link>
                    <span className="ms-2">· {new Date(post.createdAt).toLocaleDateString()}</span>
                </Card.Subtitle>
                <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Card.Text>

                {/* Summarize with AI */}
                {typeof post.content === 'string' && post.content.trim().length > 0 && (
                    <div className="mb-2">
                        <Button
                            variant="outline-info"
                            size="sm"
                            disabled={summarizing}
                            onClick={async () => {
                                if (!showSummary) {
                                    setShowSummary(true);
                                }
                                if (!summary) {
                                    try {
                                        setSummarizing(true);
                                        const response = await api.post(
                                            '/chatbot',
                                            { message: post.content, mode: 'summarize' },
                                            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                        );
                                        setSummary(response.data?.response || 'No summary available.');
                                    } catch (e) {
                                        setSummary("Sorry, I couldn't generate a summary.");
                                    } finally {
                                        setSummarizing(false);
                                    }
                                } else {
                                    setShowSummary((v) => !v);
                                }
                            }}
                        >
                            {summarizing ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" className="me-2" /> Summarizing...
                                </>
                            ) : (
                                'Summarize with AI'
                            )}
                        </Button>
                        <Collapse in={showSummary}>
                            <div>
                                <Card className="mt-2" bg="secondary" text="white">
                                    <Card.Body>
                                        <Card.Title className="h6 mb-2">AI Summary</Card.Title>
                                        <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{summary}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </div>
                        </Collapse>
                    </div>
                )}
            </Card.Body>
            <Card.Footer className="bg-transparent border-top border-secondary d-flex justify-content-between align-items-center">
                {/* Post Like Button */}
                <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={handlePostLikeToggle}
                    disabled={likingPost || !auth.isAuthenticated}
                    style={{
                        color: isPostLiked() ? '#ff6b6b' : '#6c757d',
                        border: 'none',
                        background: 'none',
                        padding: '0.25rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                    title={isPostLiked() ? 'Unlike this post' : 'Like this post'}
                >
                    {isPostLiked() ? (
                        <HeartFill size={18} style={{ color: '#ff6b6b' }} />
                    ) : (
                        <Heart size={18} style={{ color: '#6c757d' }} />
                    )}
                    <span 
                        style={{ 
                            fontSize: '0.875rem',
                            color: isPostLiked() ? '#ff6b6b' : '#6c757d',
                            marginLeft: '0.25rem'
                        }}
                    >
                        {getPostLikeCount() > 0 && getPostLikeCount()}
                    </span>
                    {likingPost && <span className="ms-1" style={{ fontSize: '0.75rem' }}>...</span>}
                </Button>

                {/* Comment Button */}
                <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleToggleComments}
                    aria-expanded={showComments}
                >
                    <Chat className="me-2" /> 
                    Comment {post.comments && post.comments.length > 0 && `(${post.comments.length})`}
                </Button>
            </Card.Footer>

            {/* Comments Section with Collapse */}
            <Collapse in={showComments}>
                <div>
                    <Card.Body className="pt-0">
                        {/* Add Comment Form (only if authenticated) */}
                        {auth.isAuthenticated && (
                            <Form onSubmit={handleAddComment} className="mb-3">
                                <InputGroup>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        style={{ 
                                            resize: 'none',
                                            backgroundColor: '#1f1f1f',
                                            color: '#fff',
                                            borderColor: '#495057'
                                        }}
                                        required
                                        disabled={submitting || loadingUsername}
                                    />
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={submitting || !commentText.trim() || loadingUsername}
                                    >
                                        <Send />
                                    </Button>
                                </InputGroup>
                            </Form>
                        )}

                        {/* Comments List */}
                        {!post.comments || post.comments.length === 0 ? (
                            <div className="text-center py-3 text-white-50">
                                <small>No comments yet. Be the first!</small>
                            </div>
                        ) : (
                            <div className="comments-container">
                                {[...post.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((comment, index) => (
                                    <div
                                        key={index}
                                        className="comment-item mb-3 p-3 rounded"
                                        style={{
                                            backgroundColor: '#1f1f1f',
                                            border: '1px solid #495057',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="text-white fw-bold" style={{ fontSize: '0.875rem' }}>
                                                @{comment.username}
                                            </span>
                                            <small className="text-white-50 ms-2" style={{ fontSize: '0.75rem' }}>
                                                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </div>
                                        <p className="mb-2 text-white small" style={{ 
                                            whiteSpace: 'pre-wrap',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.4'
                                        }}>
                                            {comment.text}
                                        </p>
                                        {/* Comment Like Button */}
                                        <div className="d-flex align-items-center">
                                            <Button
                                                variant="link"
                                                className="p-0 text-decoration-none"
                                                onClick={() => handleCommentLikeToggle(comment)}
                                                disabled={likingComments[comment.createdAt] || !auth.isAuthenticated}
                                                style={{
                                                    color: isCommentLiked(comment) ? '#ff6b6b' : '#6c757d',
                                                    border: 'none',
                                                    background: 'none',
                                                    padding: '0.25rem 0.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                                title={isCommentLiked(comment) ? 'Unlike this comment' : 'Like this comment'}
                                            >
                                                {isCommentLiked(comment) ? (
                                                    <HeartFill size={16} style={{ color: '#ff6b6b' }} />
                                                ) : (
                                                    <Heart size={16} style={{ color: '#6c757d' }} />
                                                )}
                                                <span 
                                                    style={{ 
                                                        fontSize: '0.875rem',
                                                        color: isCommentLiked(comment) ? '#ff6b6b' : '#6c757d',
                                                        marginLeft: '0.25rem'
                                                    }}
                                                >
                                                    {getCommentLikeCount(comment) > 0 && getCommentLikeCount(comment)}
                                                </span>
                                                {likingComments[comment.createdAt] && (
                                                    <span className="ms-1" style={{ fontSize: '0.75rem' }}>...</span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
};

export default PostCard;