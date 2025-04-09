import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, InputGroup } from 'react-bootstrap';
import axios from 'axios';

// Application codes list
const APPLICATION_CODES = [
  'abb', 'acp', 'aep', 'ami', 'amp', 'bpx', 'can', 'djd',
  'fcs', 'ibo', 'ikc', 'ino', 'lsg', 'mbr', 'nxn', 'osn',
  'rok', 'wso', 'xsf'
];

const DeploymentsList = () => {
  const [deployments, setDeployments] = useState([]);
  const [filteredDeployments, setFilteredDeployments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [applicationFilter, setApplicationFilter] = useState('');

  // New deployment state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeployment, setNewDeployment] = useState({
    serviceId: '',
    version: '',
    changes: '',
    branchName: 'main'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // View file state
  const [showViewFileModal, setShowViewFileModal] = useState(false);
  const [selectedDeploymentFiles, setSelectedDeploymentFiles] = useState([]);
  const [selectedDeploymentName, setSelectedDeploymentName] = useState('');

  // Delete deployment state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deploymentToDelete, setDeploymentToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Apply application filter
    if (applicationFilter) {
      setFilteredDeployments(
          deployments.filter(deployment =>
              deployment.application === applicationFilter
          )
      );
    } else {
      setFilteredDeployments(deployments);
    }
  }, [applicationFilter, deployments]);

  const fetchData = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Set headers
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      // Fetch deployments and services in parallel
      const [deploymentsRes, servicesRes] = await Promise.all([
        axios.get('/api/deployments', config),
        axios.get('/api/services', config)
      ]);

      setDeployments(deploymentsRes.data.deployments);
      setFilteredDeployments(deploymentsRes.data.deployments);
      setServices(servicesRes.data.services);
      setLoading(false);
    } catch (err) {
      setError('Error fetching data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewDeployment({
      ...newDeployment,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFilterChange = (e) => {
    setApplicationFilter(e.target.value);
  };

  const clearFilter = () => {
    setApplicationFilter('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('File upload is mandatory for deployment creation');
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Create form data
      const formData = new FormData();
      formData.append('serviceId', newDeployment.serviceId);
      formData.append('version', newDeployment.version);
      formData.append('changes', newDeployment.changes);
      formData.append('branchName', newDeployment.branchName);
      formData.append('file', selectedFile);

      // Set headers
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      };

      const res = await axios.post('/api/deployments/with-file', formData, config);

      // Add new deployment to state
      const newDeploymentWithFile = {
        ...res.data.deployment,
        files: [res.data.file]
      };

      setDeployments([newDeploymentWithFile, ...deployments]);

      // Show success message
      setSuccess(`Deployment created successfully with documentation file`);

      // Reset form and close modal
      setNewDeployment({ serviceId: '', version: '', changes: '', branchName: 'main' });
      setSelectedFile(null);
      setShowAddModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating deployment');
    }
  };

  const handleViewFiles = (deployment) => {
    setSelectedDeploymentName(`${deployment.service_name} - ${deployment.version}`);
    setSelectedDeploymentFiles(deployment.files || []);
    setShowViewFileModal(true);
  };

  const handleDownloadFile = async (fileId) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Set headers
      const config = {
        headers: {
          'x-auth-token': token
        },
        responseType: 'blob' // Important for file downloads
      };

      const response = await axios.get(`/api/deployments/files/${fileId}`, config);

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Try to get filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error downloading file');
    }
  };

  const handleDeleteClick = (deployment) => {
    setDeploymentToDelete(deployment);
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

      await axios.delete(`/api/deployments/${deploymentToDelete.id}`, config);

      // Update deployments list
      setDeployments(deployments.filter(deployment => deployment.id !== deploymentToDelete.id));

      // Show success message
      setSuccess(`Deployment deleted successfully`);

      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

      // Close modal
      setShowDeleteModal(false);
      setDeploymentToDelete(null);
    } catch (err) {
      setError('Error deleting deployment');
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
        <Container className="mt-4">
          <div className="text-center">
            <h3>Loading deployments...</h3>
          </div>
        </Container>
    );
  }

  return (
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h2>Deployment Management</h2>
          </Col>
          <Col className="text-end">
            <Button
                variant="danger"
                onClick={() => setShowAddModal(true)}
                disabled={services.length === 0}
            >
              <i className="fas fa-plus-circle me-2"></i> Add New Deployment
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {services.length === 0 && (
            <Alert variant="warning">
              You need to create a service before adding deployments.
              <Button
                  variant="link"
                  href="/admin/services"
                  className="p-0 ms-2"
              >
                Go to Services
              </Button>
            </Alert>
        )}

        {/* Application Filter */}
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Filter by Application</Form.Label>
                  <InputGroup>
                    <Form.Select
                        value={applicationFilter}
                        onChange={handleFilterChange}
                    >
                      <option value="">All Applications</option>
                      {APPLICATION_CODES.map(code => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                      ))}
                    </Form.Select>
                    <Button
                        variant="outline-secondary"
                        onClick={clearFilter}
                        disabled={!applicationFilter}
                    >
                      Clear
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            {filteredDeployments.length > 0 ? (
                <Table responsive hover>
                  <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service</th>
                    <th>Application</th>
                    <th>Version</th>
                    <th>Branch</th>
                    <th>Changes</th>
                    <th>Created By</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filteredDeployments.map(deployment => (
                      <tr key={deployment.id}>
                        <td>{deployment.id}</td>
                        <td>{deployment.service_name}</td>
                        <td>
                          <span className="badge bg-secondary">{deployment.application || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="badge bg-dark">{deployment.version}</span>
                        </td>
                        <td>
                          <span className="badge bg-info">{deployment.branch_name || 'main'}</span>
                        </td>
                        <td>{deployment.changes}</td>
                        <td>{deployment.creator_email}</td>
                        <td>{new Date(deployment.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleViewFiles(deployment)}
                          >
                            View Files
                          </Button>
                          <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteClick(deployment)}
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
                  {applicationFilter ? (
                      <p>No deployments found for application: <strong>{applicationFilter}</strong></p>
                  ) : (
                      <p>No deployments found</p>
                  )}
                  {services.length > 0 && !applicationFilter && (
                      <Button variant="danger" onClick={() => setShowAddModal(true)}>
                        Add First Deployment
                      </Button>
                  )}
                </div>
            )}
          </Card.Body>
        </Card>

        {/* Add Deployment Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Deployment</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Service</Form.Label>
                <Form.Select
                    name="serviceId"
                    value={newDeployment.serviceId}
                    onChange={handleInputChange}
                    required
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name} {service.application ? `(${service.application})` : ''}
                      </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Version</Form.Label>
                <Form.Control
                    type="text"
                    name="version"
                    value={newDeployment.version}
                    onChange={handleInputChange}
                    placeholder="e.g., 1.0.0"
                    required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Release Branch</Form.Label>
                <Form.Control
                    type="text"
                    name="branchName"
                    value={newDeployment.branchName}
                    onChange={handleInputChange}
                    placeholder="e.g., main, release/v1.0, feature/xyz"
                    required
                />
                <Form.Text className="text-muted">
                  The branch name this deployment was created from (defaults to 'main')
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Changes</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="changes"
                    value={newDeployment.changes}
                    onChange={handleInputChange}
                    placeholder="Describe the changes in this deployment"
                    required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Documentation File (Required)</Form.Label>
                <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    required
                />
                <Form.Text className="text-muted">
                  Supported file types: PDF, Word, Excel, PowerPoint. Maximum size: 200MB.
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Add Deployment
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* View Files Modal */}
        <Modal show={showViewFileModal} onHide={() => setShowViewFileModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Deployment Files</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Files for deployment: <strong>{selectedDeploymentName}</strong>
            </p>
            {selectedDeploymentFiles && selectedDeploymentFiles.length > 0 ? (
                <Table responsive>
                  <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {selectedDeploymentFiles.map(file => (
                      <tr key={file.id}>
                        <td>{file.file_name}</td>
                        <td>{file.file_type || 'Unknown'}</td>
                        <td>
                          {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'Unknown'}
                        </td>
                        <td>
                          <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDownloadFile(file.id)}
                          >
                            Download
                          </Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </Table>
            ) : (
                <p>No files found for this deployment.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewFileModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this deployment?
            This action cannot be undone and will also delete all associated files.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete Deployment
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};

export default DeploymentsList;
