import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const CreatePost = ({ onNewPost }) => {
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { auth } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/posts', { content }, {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });

            onNewPost(response.data); // Pass the new post up to the parent page
            setContent(''); // Clear the text area
            
        } catch (err) {
            setError(`Failed to create post: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card bg="dark" text="white" className="p-4 shadow-lg border-secondary mb-4">
            <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3" controlId="postContent">
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Share your thoughts, experiences, or interview tips..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="bg-transparent text-white border-secondary"
                    />
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" disabled={loading || !content}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Post'}
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

// --- IMPORTANT ---
// We need to import Card at the top, but we'll re-use it so much.
// Add this import line at the top of the file.
import { Card } from 'react-bootstrap';
// ---

export default CreatePost;