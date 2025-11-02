import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button, Row, Col, Image } from 'react-bootstrap';
import { PersonPlusFill, PersonDashFill } from 'react-bootstrap-icons';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import PostCard from '../components/PostCard'; // We'll reuse our PostCard component

const ProfilePage = () => {
    const { id: profileId } = useParams(); // Get the user ID from the URL
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isFollowing, setIsFollowing] = useState(false);
    const [isCurrentUser, setIsCurrentUser] = useState(false);

    // Function to fetch all profile data
    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/users/${profileId}`);
            setProfile(data.user);
            setPosts(data.posts);
            
            // Check if the logged-in user is already following this profile
            if (auth.user) {
                setIsCurrentUser(auth.user.id === data.user._id);
                setIsFollowing(data.user.followers.includes(auth.user.id));
            }
            
        } catch (err) {
            console.error(err);
            setError('User not found.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        // --- ADD THIS COMMENT TO FIX THE WARNING ---
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileId, auth.user]); // Re-fetch if the profile ID or logged-in user changes

    const handleFollow = async () => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await api.post(`/users/${profileId}/follow`, {}, {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            setIsFollowing(true);
            // Re-fetch profile to update follower count (optional but good)
            fetchProfile(); 
        } catch (err) {
            console.error('Failed to follow', err);
        }
    };

    const handleUnfollow = async () => {
        try {
            await api.post(`/users/${profileId}/unfollow`, {}, {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            setIsFollowing(false);
            fetchProfile();
        } catch (err) {
            console.error('Failed to unfollow', err);
        }
    };

    // Render the follow/unfollow button
    const renderFollowButton = () => {
        if (isCurrentUser) return null; // Can't follow yourself

        if (isFollowing) {
            return (
                <Button variant="outline-secondary" onClick={handleUnfollow}>
                    <PersonDashFill className="me-2" /> Unfollow
                </Button>
            );
        } else {
            return (
                <Button variant="primary" onClick={handleFollow}>
                    <PersonPlusFill className="me-2" /> Follow
                </Button>
            );
        }
    };

    if (loading) {
        return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
    }

    if (error) {
        return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    {/* Profile Header */}
                    <Card bg="dark" text="white" className="p-4 mb-4 shadow-lg border-secondary">
                        <Card.Body className="d-flex align-items-center">
                            <Image 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`} 
                                roundedCircle 
                                width={80} 
                                height={80} 
                                className="me-4 bg-light"
                            />
                            <div>
                                <h2 className="display-6 mb-0">{profile.username}</h2>
                                <p className="text-white-50 mb-2">Role: {profile.role}</p>
                                <div className="d-flex">
                                    <p className="me-3"><strong>{profile.followers.length}</strong> Followers</p>
                                    <p><strong>{profile.following.length}</strong> Following</p>
                                </div>
                            </div>
                            <div className="ms-auto">
                                {auth.isAuthenticated && renderFollowButton()}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* User's Posts */}
                    <h3 className="mb-3">Posts by {profile.username}</h3>
                    {posts.length === 0 ? (
                        <Alert variant="info">This user hasn't posted anything yet.</Alert>
                    ) : (
                        posts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;