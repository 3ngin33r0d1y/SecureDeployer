import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { email, password, confirmPassword, role } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Set headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const body = { email, password, role };
      
      const res = await axios.post('/api/auth/register', body, config);
      
      setSuccess('User registered successfully');
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      });
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };
  
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">Register New User</h4>
            </div>
            <div className="card-body p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="Enter email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter password"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    placeholder="Confirm password"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={role}
                    onChange={onChange}
                  >
                    <option value="user">Regular User</option>
                    <option value="admin">Administrator</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  variant="danger" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register User'}
                </Button>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
