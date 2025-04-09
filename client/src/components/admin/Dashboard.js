import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    services: 0,
    deployments: 0
  });
  const [recentDeployments, setRecentDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Set headers
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        // Fetch users count
        const usersRes = await axios.get('/api/users', config);
        
        // Fetch services
        const servicesRes = await axios.get('/api/services', config);
        
        // Fetch deployments
        const deploymentsRes = await axios.get('/api/deployments', config);
        
        setStats({
          users: usersRes.data.users.length,
          services: servicesRes.data.services.length,
          deployments: deploymentsRes.data.deployments.length
        });
        
        // Get recent deployments (last 5)
        setRecentDeployments(deploymentsRes.data.deployments.slice(0, 5));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <h3>Loading dashboard data...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="dashboard-stat">
            <Card.Body className="text-center">
              <div className="dashboard-stat-icon mb-2">
                <i className="fas fa-users"></i>
              </div>
              <div className="dashboard-stat-number">{stats.users}</div>
              <div className="dashboard-stat-title">Total Users</div>
              <Link to="/admin/users" className="btn btn-sm btn-outline-danger mt-3">
                Manage Users
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-stat">
            <Card.Body className="text-center">
              <div className="dashboard-stat-icon mb-2">
                <i className="fas fa-cogs"></i>
              </div>
              <div className="dashboard-stat-number">{stats.services}</div>
              <div className="dashboard-stat-title">Total Services</div>
              <Link to="/admin/services" className="btn btn-sm btn-outline-danger mt-3">
                Manage Services
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-stat">
            <Card.Body className="text-center">
              <div className="dashboard-stat-icon mb-2">
                <i className="fas fa-rocket"></i>
              </div>
              <div className="dashboard-stat-number">{stats.deployments}</div>
              <div className="dashboard-stat-title">Total Deployments</div>
              <Link to="/admin/deployments" className="btn btn-sm btn-outline-danger mt-3">
                Manage Deployments
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>Quick Actions</Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/admin/register" className="btn btn-danger">
                  <i className="fas fa-user-plus me-2"></i> Add New User
                </Link>
                <Link to="/admin/services" className="btn btn-danger">
                  <i className="fas fa-plus-circle me-2"></i> Create Service
                </Link>
                <Link to="/admin/deployments" className="btn btn-danger">
                  <i className="fas fa-upload me-2"></i> New Deployment
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Deployments */}
      <Row>
        <Col>
          <Card>
            <Card.Header>Recent Deployments</Card.Header>
            <Card.Body>
              {recentDeployments.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Version</th>
                      <th>Created By</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDeployments.map(deployment => (
                      <tr key={deployment.id}>
                        <td>{deployment.service_name}</td>
                        <td>
                          <Badge bg="dark">{deployment.version}</Badge>
                        </td>
                        <td>{deployment.creator_email}</td>
                        <td>{new Date(deployment.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/admin/deployments/${deployment.id}`} className="btn btn-sm btn-outline-dark">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3">
                  <p>No deployments found</p>
                  <Link to="/admin/deployments" className="btn btn-danger">
                    Create First Deployment
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
