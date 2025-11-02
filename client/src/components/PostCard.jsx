import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Chat } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom'; // <-- 1. IMPORT LINK

const PostCard = ({ post }) => {
    return (
        <Card bg="dark" text="white" className="mb-3 shadow-lg border-secondary">
            <Card.Body>
                <Card.Subtitle className="mb-2 text-white-50">
                    <Link to={`/profile/${post.author._id}`} className="text-white text-decoration-none">
                    <strong>@{post.author.username}</strong></Link>
                    <span className="ms-2">· {new Date(post.createdAt).toLocaleDateString()}</span>
                </Card.Subtitle>
                <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{post.content}</Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-top border-secondary d-flex justify-content-end">
                <Button variant="outline-primary" size="sm">
                    <Chat className="me-2" /> Comment
                </Button>
            </Card.Footer>
        </Card>
    );
};

export default PostCard;