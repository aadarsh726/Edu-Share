import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Spinner, Alert, Form, Button, InputGroup, Toast, ToastContainer } from 'react-bootstrap';
import { ChatDotsFill, Search } from 'react-bootstrap-icons';
import api from '../api/axios';
import ResourceCard from '../components/ResourceCard';
import AuthContext from '../context/AuthContext';

const HomePage = () => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filteredResources, setFilteredResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const { auth } = useContext(AuthContext);

    // Fetch resources (paginated)
    const fetchResources = async (nextPage = page) => {
        try {
            setLoading(true);
            const response = await api.get(`/resources?page=${nextPage}&limit=6`);
            setItems(response.data.items);
            setFilteredResources(response.data.items);
            setPage(response.data.page);
            setTotalPages(response.data.totalPages);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load resources. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle the search (this is our "AI Search" logic!)
    const handleSearch = (e) => {
        e.preventDefault();
        
        // --- THIS IS OUR "AI" SEARCH ---
        // For now, it's a simple text filter.
        // Later, we can send 'searchTerm' to an AI endpoint!
        const term = searchTerm.toLowerCase();
        
        if (term === '') {
            setFilteredResources(items); // Reset if search is empty
        } else {
            const filtered = items.filter(resource => 
                resource.title.toLowerCase().includes(term) ||
                resource.subject.toLowerCase().includes(term) ||
                (resource.description && resource.description.toLowerCase().includes(term))
            );
            setFilteredResources(filtered);
        }
    };

    // Toast handler
    const handleShowToast = (variant, message) => {
        setToastVariant(variant);
        setToastMessage(message);
        setShowToast(true);
    };

    // Helper to show a loading spinner
    const renderLoading = () => (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-2">Loading Resources...</p>
        </div>
    );

    // Helper to show the grid of resources
    const renderResources = () => (
        <>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {!error && filteredResources.length === 0 && (
                <Alert variant="info">
                    {searchTerm 
                        ? 'No resources found for your search.' 
                        : 'No resources have been uploaded yet.'}
                </Alert>
            )}
            
            <Row xs={1} md={2} lg={3} className="g-4">
                {filteredResources.map((resource) => (
                    <Col key={resource._id}>
                        <ResourceCard 
                            resource={resource}
                            onDeleted={() => fetchResources(page)}
                            showToast={handleShowToast}
                        />
                    </Col>
                ))}
            </Row>
            <div className="d-flex justify-content-center mt-4">
                <Button 
                    variant="secondary" 
                    className="me-2" 
                    disabled={page <= 1 || loading}
                    onClick={() => fetchResources(page - 1)}
                >
                    Prev
                </Button>
                <Button 
                    variant="secondary" 
                    disabled={page >= totalPages || loading}
                    onClick={() => fetchResources(page + 1)}
                >
                    Next
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* --- 1. HERO SECTION (from reference) --- */}
            <Container className="text-center py-5 my-5">
                <h1 className="display-4 fw-bold">Welcome to <span className="text-primary">EduShare</span></h1>
                <p className="lead text-white-50 mb-4">
                    Your new home for collaborative academic resources.
                </p>
                <Form className="hero-search" style={{ maxWidth: '600px', margin: '0 auto' }} onSubmit={handleSearch}>
                    <InputGroup>
                        <Form.Control
                            type="search"
                            placeholder="Ask our AI... (e.g., '3rd semester python notes')"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"  // <-- ADD THIS LINE
                        />

                        <Button variant="primary" type="submit">
                            <Search className="me-2" /> Search
                        </Button>
                    </InputGroup>
                </Form>
            </Container>

            {/* --- 2. RESOURCE GRID (our existing code) --- */}
            <Container className="pb-5">
                <h2 className="mb-4 display-5">Top <span className="text-primary">Resources</span></h2>                {loading ? renderLoading() : renderResources()}
            </Container>

            {/* --- 3. AI BOT (our existing code) --- */}
            {auth.isAuthenticated && (
                <div className="ai-bot-fab" title="AI Chat Assistant" onClick={() => alert('AI Bot chat window will open here!')}>
                    <ChatDotsFill size={28} />
                </div>
            )}

            {/* Toast Container */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
                <Toast 
                    onClose={() => setShowToast(false)} 
                    show={showToast} 
                    delay={3000} 
                    autohide
                    bg={toastVariant === 'success' ? 'success' : 'danger'}
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
        </>
    );
};

export default HomePage;