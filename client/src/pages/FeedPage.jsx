import React, { useState, useEffect, useContext } from 'react';
import { Container, Spinner, Alert, Col, Row, Toast, ToastContainer } from 'react-bootstrap';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

const FeedPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const { auth } = useContext(AuthContext);

    // Toast handler
    const handleShowToast = (variant, message) => {
        setToastVariant(variant === 'success' ? 'success' : 'danger');
        setToastMessage(message);
        setShowToast(true);
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (err) {
                setError(`Failed to load the feed: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // This function adds the new post to the top of the list
    const handleNewPost = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    // This function updates a post when a comment is added
    const handleCommentAdded = (updatedPost) => {
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="display-5 mb-4">Community Feed</h1>
                    
                    {/* Only show the "Create Post" box if logged in */}
                    {auth.isAuthenticated && <CreatePost onNewPost={handleNewPost} />}

                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2">Loading Feed...</p>
                        </div>
                    )}
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    {!loading && !error && (
                        <div className="mt-4">
                            {posts.length === 0 ? (
                                <Alert variant="info">The feed is empty. Be the first to post!</Alert>
                            ) : (
                                posts.map(post => (
                                    <PostCard 
                                        key={post._id} 
                                        post={post}
                                        showToast={handleShowToast}
                                        onCommentAdded={handleCommentAdded}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </Col>
            </Row>

            {/* Toast Container */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast 
                    onClose={() => setShowToast(false)} 
                    show={showToast} 
                    delay={3000} 
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Header>
                        <strong className="me-auto">
                            {toastVariant === 'success' ? 'Success' : 'Error'}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
};

export default FeedPage;