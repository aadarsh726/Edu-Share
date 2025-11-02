import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap'; // Removed unused 'NavDropdown'
import { LinkContainer } from 'react-router-bootstrap';
import AuthContext from '../context/AuthContext';

const AppNavbar = () => {
    const { auth, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const logoutHandler = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    // We have DELETED the 'loggedInLinks' and 'guestLinks' constants from here.
    // The logic is now inside the 'return' statement.

    return (
        <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand className="fw-bold text-primary">EduShare</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        
                        {/* --- THIS IS THE FIX --- */}
                        {/* We define the links *inside* the check now */}
                        
                        {auth.isAuthenticated && auth.user ? (
                            // User is Logged In
                            <>
                                <LinkContainer to="/feed">
                                    <Nav.Link>Feed</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/upload">
                                    <Nav.Link>Upload</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/leaderboard">
                                    <Nav.Link>Leaderboard</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to={`/profile/${auth.user.id}`}>
                                    <Nav.Link>Profile</Nav.Link>
                                </LinkContainer>
                                <Nav.Link onClick={logoutHandler}>
                                    {/* I removed the <i> icon tag as it requires FontAwesome */}
                                    Logout 
                                </Nav.Link>
                            </>
                        ) : (
                            // User is a Guest
                            <>
                                <LinkContainer to="/login">
                                    <Nav.Link>Login</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/register">
                                    <Nav.Link>Register</Nav.Link>
                                </LinkContainer>
                            </>
                        )}

                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;