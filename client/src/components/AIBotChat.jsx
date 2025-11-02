import React, { useState, useRef, useEffect } from 'react';
import { Offcanvas, Form, Button, InputGroup, ListGroup, Spinner, Card, ButtonGroup } from 'react-bootstrap';
import { Send, X, Robot } from 'react-bootstrap-icons';
import api from '../api/axios';

const AIBotChat = ({ show, onHide }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm EduShare AI Assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState('qa'); // Default mode is Q&A
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Mode options
    const modes = [
        { value: 'summarize', label: 'Summarize' },
        { value: 'explain', label: 'Explain' },
        { value: 'qa', label: 'Q&A' },
        { value: 'recommend', label: 'Recommend' }
    ];

    // Auto-scroll to bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when offcanvas opens
    useEffect(() => {
        if (show && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [show]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!inputMessage.trim() || isLoading) {
            return;
        }

        const userMessage = {
            id: Date.now(),
            text: inputMessage.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        // Add user message instantly
        setMessages(prev => [...prev, userMessage]);
        const messageToSend = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);

        try {
            // Call the backend API to get AI response
            const response = await api.post(
                '/chatbot',
                { message: messageToSend, mode: mode },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Add AI response to messages
            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.response || "Sorry, I couldn't generate a response.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            console.error('Failed to get AI response:', err);
            
            // Show error message in chat
            const errorMessage = {
                id: Date.now() + 1,
                text: err.response?.data?.error || "Sorry, I couldn't connect to the AI. Please try again later.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <Offcanvas 
            show={show} 
            onHide={onHide} 
            placement="end" 
            style={{ width: '400px', maxWidth: '90vw' }}
        >
            <Offcanvas.Header className="bg-dark text-white border-bottom border-secondary">
                <Offcanvas.Title className="d-flex align-items-center">
                    <Robot className="me-2" size={24} />
                    <span>EduShare AI Assistant</span>
                </Offcanvas.Title>
                <Button
                    variant="link"
                    onClick={onHide}
                    className="text-white p-0 ms-auto"
                    style={{ fontSize: '1.5rem', lineHeight: 1 }}
                >
                    <X />
                </Button>
            </Offcanvas.Header>
            
            <Offcanvas.Body 
                className="bg-dark p-0 d-flex flex-column"
                style={{ height: '100%' }}
            >
                {/* Mode Selector Buttons */}
                <div className="border-bottom border-secondary p-3 bg-dark">
                    <div className="small text-white-50 mb-2">Select Mode:</div>
                    <ButtonGroup className="w-100" size="sm">
                        {modes.map((m) => (
                            <Button
                                key={m.value}
                                variant={mode === m.value ? 'primary' : 'outline-secondary'}
                                onClick={() => setMode(m.value)}
                                className="flex-fill"
                                style={{
                                    borderColor: mode === m.value ? '#0d6efd' : '#495057',
                                    color: mode === m.value ? '#fff' : '#adb5bd'
                                }}
                            >
                                {m.label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>

                {/* Messages Area */}
                <div 
                    className="flex-grow-1 overflow-auto px-3 py-3"
                    style={{ 
                        maxHeight: 'calc(100vh - 280px)',
                        scrollBehavior: 'smooth'
                    }}
                >
                    <ListGroup variant="flush" className="bg-transparent">
                        {messages.map((message) => (
                            <ListGroup.Item
                                key={message.id}
                                className="bg-transparent border-0 px-0 mb-3"
                            >
                                    <div
                                        className={`d-flex mb-2 ${
                                            message.sender === 'user' 
                                                ? 'justify-content-end' 
                                                : 'justify-content-start'
                                        }`}
                                    >
                                        <Card
                                            className={`${
                                                message.sender === 'user'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-secondary text-white'
                                            } border-0`}
                                            style={{
                                                maxWidth: '75%',
                                                borderRadius: '18px',
                                                wordWrap: 'break-word',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <Card.Body className="p-3">
                                                <div className="small mb-1 opacity-75">
                                                    {message.sender === 'user' ? 'You' : 'AI Assistant'}
                                                </div>
                                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                                    {message.text}
                                                </div>
                                                <div 
                                                    className="small mt-2 opacity-50"
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    {formatTime(message.timestamp)}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </div>
                            </ListGroup.Item>
                        ))}
                        
                        {isLoading && (
                            <ListGroup.Item className="bg-transparent border-0 px-0 mb-2">
                                <div className="d-flex justify-content-start">
                                    <Card className="bg-secondary text-white border-0" style={{ borderRadius: '18px' }}>
                                        <Card.Body className="p-3">
                                            <Spinner 
                                                animation="border" 
                                                size="sm" 
                                                variant="light"
                                                className="me-2"
                                            />
                                            <span className="small">AI is thinking...</span>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </ListGroup.Item>
                        )}
                        
                        <div ref={messagesEndRef} />
                    </ListGroup>
                </div>

                {/* Input Area */}
                <div className="border-top border-secondary p-3 bg-dark">
                    <Form onSubmit={handleSendMessage}>
                        <InputGroup>
                            <Form.Control
                                ref={inputRef}
                                as="textarea"
                                rows={2}
                                placeholder="Type your message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                style={{
                                    backgroundColor: '#1f1f1f',
                                    color: '#fff',
                                    borderColor: '#495057',
                                    resize: 'none',
                                    borderRadius: '12px 0 0 12px'
                                }}
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!inputMessage.trim() || isLoading}
                                style={{
                                    borderRadius: '0 12px 12px 0',
                                    borderLeft: 'none'
                                }}
                            >
                                <Send />
                            </Button>
                        </InputGroup>
                        <div className="small text-white-50 mt-2 text-center">
                            Press Enter to send, Shift+Enter for new line
                        </div>
                    </Form>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default AIBotChat;

