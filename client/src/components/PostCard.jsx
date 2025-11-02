import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Collapse, Form, InputGroup } from 'react-bootstrap';
import { Chat, Send } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const PostCard = ({ post, onCommentAdded, showToast }) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');
    const [loadingUsername, setLoadingUsername] = useState(false);
    const { auth } = useContext(AuthContext);

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

            // Update the post with new comment
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
            </Card.Body>
            <Card.Footer className="bg-transparent border-top border-secondary d-flex justify-content-end">
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
                                        <p className="mb-0 text-white small" style={{ 
                                            whiteSpace: 'pre-wrap',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.4'
                                        }}>
                                            {comment.text}
                                        </p>
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