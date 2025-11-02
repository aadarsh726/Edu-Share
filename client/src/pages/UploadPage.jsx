import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Our pre-configured axios
import AuthContext from '../context/AuthContext';

// Import React-Bootstrap components
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Upload } from 'react-bootstrap-icons';

const UPLOAD_URL = '/resources/upload';

const UploadPage = () => {
    const { auth } = useContext(AuthContext); // Get auth state for the token
    const navigate = useNavigate();

    // Form state
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('');
    const [course, setCourse] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null); // State for the file itself

    // UI state
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Get the first file
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        // 1. Create FormData
        // This is necessary for sending files
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('semester', semester);
        formData.append('course', course);
        formData.append('description', description);
        formData.append('file', file); // This key 'file' MUST match our backend

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // 2. Send the request
            await api.post(UPLOAD_URL, formData, {
                headers: {
                    // 3. Add the Auth Token
                    'Authorization': `Bearer ${auth.token}`,
                    // 4. Set the Content-Type for files
                    'Content-Type': 'multipart/form-data',
                },
            });

            setLoading(false);
            setSuccess('File uploaded successfully! Redirecting...');

            // Redirect to home page after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setLoading(false);
            if (!err?.response) {
                setError('No Server Response');
            } else {
                setError('File Upload Failed. Check file type or permissions.');
            }
        }
    };

    return (
        <div className="py-5 d-flex align-items-center">
            <Container>
                <Card bg="dark" text="white" className="p-4 shadow-lg border-secondary" style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <Card.Body>
                        <h2 className="text-center mb-4 text-primary">
                            <Upload className="me-2" /> Upload Resource
                        </h2>
                        
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        
                        <Form onSubmit={handleSubmit}>
                            {/* Title */}
                            <Form.Group className="mb-3" controlId="title">
                                <Form.Label>Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., Chapter 5: Network Layers"
                                    onChange={(e) => setTitle(e.target.value)}
                                    value={title}
                                    required
                                />
                            </Form.Group>

                            {/* Subject & Semester */}
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3" controlId="subject">
                                        <Form.Label>Subject</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g., Computer Networks"
                                            onChange={(e) => setSubject(e.target.value)}
                                            value={subject}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="semester">
                                        <Form.Label>Semester</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="e.g., 5"
                                            onChange={(e) => setSemester(e.target.value)}
                                            value={semester}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Course (Optional) */}
                            <Form.Group className="mb-3" controlId="course">
                                <Form.Label>Course (Optional)</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., B.Sc. IT"
                                    onChange={(e) => setCourse(e.target.value)}
                                    value={course}
                                />
                            </Form.Group>

                            {/* Description (Optional) */}
                            <Form.Group className="mb-3" controlId="description">
                                <Form.Label>Description (Optional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="A brief summary of the file..."
                                    onChange={(e) => setDescription(e.target.value)}
                                    value={description}
                                />
                            </Form.Group>

                            {/* File Input */}
                            <Form.Group className="mb-4" controlId="file">
                                <Form.Label>File</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={handleFileChange}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 fw-bold" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        {' '} Uploading...
                                    </>
                                ) : (
                                    'Upload File'
                                )}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default UploadPage;