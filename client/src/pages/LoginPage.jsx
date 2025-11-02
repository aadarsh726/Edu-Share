import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

// Import React-Bootstrap components
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

const LOGIN_URL = '/auth/login';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(LOGIN_URL, { email, password });
            login(response.data.token);
            setEmail('');
            setPassword('');
            navigate('/'); // Redirect to home
        } catch (err) {
            if (!err?.response) {
                setError('No Server Response');
            } else {
                setError('Invalid Email or Password');
            }
        }
    };

    return (
        // Use a Bootstrap container to center content and set a dark theme
        <div className="bg-dark vh-100 d-flex align-items-center">
            <Container>
                <Card bg="dark" text="white" className="p-4 shadow-lg border-secondary" style={{ maxWidth: '450px', margin: '0 auto' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4 text-primary">EduShare Login</h2>
                        
                        {/* Show error alert if 'error' exists */}
                        {error && <Alert variant="danger">{error}</Alert>}
                        
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    autoComplete="off"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 fw-bold">
                                Sign In
                            </Button>
                        </Form>
                        
                        <div className="text-center mt-4">
                            Don't have an account? <Link to="/register">Register</Link>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default LoginPage;