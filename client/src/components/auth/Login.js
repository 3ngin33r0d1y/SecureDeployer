import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the login function from AuthContext instead of direct API call
      const res = await login(formData);

      // Redirect based on role
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white text-center py-3">
                <h2>Deployment Tracker</h2>
                <p className="mb-0">Sign in to your account</p>
              </div>
              <div className="card-body p-4">
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={onSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Enter your email"
                        required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Enter your password"
                        required
                    />
                  </Form.Group>

                  <Button
                      variant="danger"
                      type="submit"
                      className="w-100 py-2"
                      disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Default admin: admin@example.com / admin123
                    </small>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
  );
};

export default Login;
