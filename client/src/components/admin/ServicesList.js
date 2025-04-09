import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

// Application codes list
const APPLICATION_CODES = [
  'abb', 'acp', 'aep', 'ami', 'amp', 'bpx', 'can', 'djd',
  'fcs', 'ibo', 'ikc', 'ino', 'lsg', 'mbr', 'nxn', 'osn',
  'rok', 'wso', 'xsf'
];

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New service state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    application: ''
  });

  // Application search state
  const [applicationSearch, setApplicationSearch] = useState('');
  const [filteredApplications, setFilteredApplications] = useState(APPLICATION_CODES);

  // Delete service state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    // Filter applications based on search
    if (applicationSearch) {
      setFilteredApplications(
          APPLICATION_CODES.filter(code =>
              code.toLowerCase().includes(applicationSearch.toLowerCase())
          )
      );
    } else {
      setFilteredApplications(APPLICATION_CODES);
    }
  }, [applicationSearch]);

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

  const handleInputChange = (e) => {
    setNewService({
      ...newService,
      [e.target.name]: e.target.value
    });
  };

  const handleApplicationSearch = (e) => {
    setApplicationSearch(e.target.value);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
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

      const res = await axios.post('/api/services', newService, config);

      // Add new service to state
      setServices([res.data.service, ...services]);

      // Show success message
      setSuccess(`Service ${res.data.service.name} created successfully`);

      // Reset form and close modal
      setNewService({ name: '', description: '', application: '' });
      setApplicationSearch('');
      setShowAddModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating service');
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Set headers
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      await axios.delete(`/api/services/${serviceToDelete.id}`, config);

      // Update services list
      setServices(services.filter(service => service.id !== serviceToDelete.id));

      // Show success message
      setSuccess(`Service ${serviceToDelete.name} deleted successfully`);

      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

      // Close modal
      setShowDeleteModal(false);
      setServiceToDelete(null);
    } catch (err) {
      setError('Error deleting service');
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
        <Container className="mt-4">
          <div className="text-center">
            <h3>Loading services...</h3>
          </div>
        </Container>
    );
  }

  return (
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h2>Service Management</h2>
          </Col>
          <Col className="text-end">
            <Button variant="danger" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus-circle me-2"></i> Add New Service
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Card>
          <Card.Body>
            {services.length > 0 ? (
                <Table responsive hover>
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Application</th>
                    <th>Description</th>
                    <th>Created By</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {services.map(service => (
                      <tr key={service.id}>
                        <td>{service.id}</td>
                        <td>{service.name}</td>
                        <td>
                          <span className="badge bg-secondary">{service.application || 'N/A'}</span>
                        </td>
                        <td>{service.description}</td>
                        <td>{service.creator_email}</td>
                        <td>{new Date(service.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button
                              variant="outline-dark"
                              size="sm"
                              className="me-2"
                              disabled
                          >
                            Edit
                          </Button>
                          <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(service)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </Table>
            ) : (
                <div className="text-center py-3">
                  <p>No services found</p>
                  <Button variant="danger" onClick={() => setShowAddModal(true)}>
                    Add First Service
                  </Button>
                </div>
            )}
          </Card.Body>
        </Card>

        {/* Add Service Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Service</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Service Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={newService.name}
                    onChange={handleInputChange}
                    placeholder="Enter service name"
                    required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Application</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Search applications..."
                    value={applicationSearch}
                    onChange={handleApplicationSearch}
                    className="mb-2"
                />
                <Form.Select
                    name="application"
                    value={newService.application}
                    onChange={handleInputChange}
                    required
                >
                  <option value="">Select Application</option>
                  {filteredApplications.map(code => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newService.description}
                    onChange={handleInputChange}
                    placeholder="Enter service description"
                    required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Add Service
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete service <strong>{serviceToDelete?.name}</strong>?
            This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete Service
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};

export default ServicesList;
