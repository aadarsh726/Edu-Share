import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

// Import React-Bootstrap components
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';

const REGISTER_URL = '/auth/register';

const RegisterPage = () => {
    const { login } = useContext(AuthContext); // Get login to auto-login after register
    const navigate = useNavigate();

    // Set up state for all form fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Send the register request to the backend
            const response = await api.post(REGISTER_URL, { 
                username, 
                email, 
                password, 
                role 
            });
            
            // Assuming the backend sends back { token: "..." }
            const token = response.data.token;
            
            // Log the user in automatically
            login(token);

            // Clear form and error
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            
            // Redirect to the home page
            navigate('/');

        } catch (err) {
            // Handle errors
            if (!err?.response) {
                setError('No Server Response');
            } else if (err.response?.data?.msg) {
                setError(err.response.data.msg); // Show specific error from backend (e.g., "User already exists")
            } else {
                setError('Registration Failed');
            }
        }
    };

    return (
        <div className="bg-dark py-5 d-flex align-items-center">
            <Container>
                <Card bg="dark" text="white" className="p-4 shadow-lg border-secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4 text-primary">Create an Account</h2>
                        
                        {error && <Alert variant="danger">{error}</Alert>}
                        
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter username"
                                    onChange={(e) => setUsername(e.target.value)}
                                    value={username}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
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
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="confirmPassword">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirm Password"
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            value={confirmPassword}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3" controlId="role">
                                <Form.Label>I am a:</Form.Label>
                                <Form.Select 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </Form.Select>
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 fw-bold mt-3">
                                Register
                            </Button>
                        </Form>
                        
                        <div className="text-center mt-4">
                            Already have an account? <Link to="/login">Login</Link>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default RegisterPage;