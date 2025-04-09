import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import axios from 'axios';

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // Set headers
        const config = {
          headers: {
            'x-auth-token': token
          }
        };

        const res = await axios.get('/api/services', config);
        setServices(res.data.services);
        setLoading(false);
      } catch (err) {
        setError('Error fetching services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
        <Container className="mt-4">
          <div className="text-center">
            <h3>Loading services...</h3>
          </div>
        </Container>
    );
  }

  if (error) {
    return (
        <Container className="mt-4">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </Container>
    );
  }

  return (
      <Container className="mt-4">
        <h2 className="mb-4">Available Services</h2>

        <Row>
          {services.length > 0 ? (
              services.map(service => (
                  <Col md={6} lg={4} key={service.id} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="bg-dark text-white">
                        <h5 className="mb-0">{service.name}</h5>
                        {service.application && (
                            <span className="badge bg-danger">{service.application}</span>
                        )}
                      </Card.Header>
                      <Card.Body>
                        <p>{service.description}</p>
                        <div className="text-muted small">
                          <div>Created by: {service.creator_email}</div>
                          <div>Date: {new Date(service.created_at).toLocaleDateString()}</div>
                        </div>
                      </Card.Body>
                      <Card.Footer className="bg-light">
                        <a
                            href={`/deployments?service=${service.id}`}
                            className="btn btn-sm btn-outline-danger"
                        >
                          View Deployments
                        </a>
                      </Card.Footer>
                    </Card>
                  </Col>
              ))
          ) : (
              <Col>
                <div className="text-center py-5">
                  <h4>No services available</h4>
                  <p className="text-muted">Services will be added by administrators.</p>
                </div>
              </Col>
          )}
        </Row>

        {services.length > 0 && (
            <Card className="mt-4">
              <Card.Header>All Services</Card.Header>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Application</th>
                    <th>Description</th>
                    <th>Created By</th>
                    <th>Created At</th>
                  </tr>
                  </thead>
                  <tbody>
                  {services.map(service => (
                      <tr key={service.id}>
                        <td>{service.id}</td>
                        <td>{service.name}</td>
                        <td>{service.application || 'N/A'}</td>
                        <td>{service.description}</td>
                        <td>{service.creator_email}</td>
                        <td>{new Date(service.created_at).toLocaleDateString()}</td>
                      </tr>
                  ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
        )}
      </Container>
  );
};

export default ServicesList;
