import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Trophy, Award, Star } from 'react-bootstrap-icons';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await api.get('/leaderboard');
                setLeaderboard(response.data.leaderboard || []);
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
                setError('Failed to load leaderboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    // Get rank badge component based on position
    const getRankBadge = (rank) => {
        switch (rank) {
            case 1:
                return (
                    <Badge bg="warning" className="ms-2" style={{ fontSize: '1rem' }}>
                        <Trophy className="me-1" /> 🥇 Gold
                    </Badge>
                );
            case 2:
                return (
                    <Badge bg="secondary" className="ms-2" style={{ fontSize: '1rem' }}>
                        <Star className="me-1" /> 🥈 Silver
                    </Badge>
                );
            case 3:
                return (
                    <Badge bg="danger" className="ms-2" style={{ fontSize: '1rem' }}>
                        <Award className="me-1" /> 🥉 Bronze
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading leaderboard...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="text-center mb-5">
                <h1 className="display-4 mb-2">
                    <Trophy className="me-2 text-warning" />
                    Leaderboard
                </h1>
                <p className="text-white-50">Top Contributors to EduShare</p>
            </div>

            {leaderboard.length === 0 ? (
                <Alert variant="info" className="text-center">
                    No contributors yet. Be the first to start contributing!
                </Alert>
            ) : (
                <Card bg="dark" text="white" className="shadow-lg border-secondary">
                    <Card.Body>
                        <div className="table-responsive">
                            <table className="table table-dark table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: '10%' }}>Rank</th>
                                        <th style={{ width: '50%' }}>Username</th>
                                        <th style={{ width: '40%' }} className="text-end">Contribution Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((user, index) => {
                                        const rank = index + 1;
                                        return (
                                            <tr key={user._id}>
                                                <td className="align-middle">
                                                    <strong className="fs-4">#{rank}</strong>
                                                    {getRankBadge(rank)}
                                                </td>
                                                <td className="align-middle">
                                                    <Link 
                                                        to={`/profile/${user._id}`}
                                                        className="text-decoration-none text-white fw-bold"
                                                        style={{ fontSize: '1.1rem' }}
                                                    >
                                                        @{user.username}
                                                    </Link>
                                                </td>
                                                <td className="align-middle text-end">
                                                    <Badge bg="primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                                                        {user.score || 0} points
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
};

export default LeaderboardPage;

