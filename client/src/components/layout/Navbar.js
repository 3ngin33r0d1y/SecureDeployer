import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';

const MainNavbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = (
    <>
      <NavDropdown title="Admin" id="admin-dropdown">
        <NavDropdown.Item as={Link} to="/admin/dashboard">Dashboard</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/admin/users">Users</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/admin/register">Register User</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/admin/services">Services</NavDropdown.Item>
        <NavDropdown.Item as={Link} to="/admin/deployments">Deployments</NavDropdown.Item>
      </NavDropdown>
    </>
  );

  const userLinks = (
    <>
      <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
      <Nav.Link as={Link} to="/services">Services</Nav.Link>
      <Nav.Link as={Link} to="/deployments">Deployments</Nav.Link>
    </>
  );

  const authLinks = (
    <>
      {user && user.role === 'admin' ? adminLinks : userLinks}
      <Nav className="ms-auto">
        <Nav.Item>
          <span className="nav-link">
            Welcome, {user && user.email}
          </span>
        </Nav.Item>
        <Nav.Item>
          <Button variant="outline-light" onClick={onLogout}>
            Logout
          </Button>
        </Nav.Item>
      </Nav>
    </>
  );

  const guestLinks = (
    <Nav className="ms-auto">
      <Nav.Link as={Link} to="/login">Login</Nav.Link>
    </Nav>
  );

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to={isAuthenticated ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/'}>
          Deployment Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated ? authLinks : guestLinks}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
