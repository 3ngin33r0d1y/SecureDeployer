import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const Dashboard = () => {
  const [deployments, setDeployments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New deployment state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeployment, setNewDeployment] = useState({
    serviceId: '',
    version: '',
    changes: '',
    branchName: 'main'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // New service state
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    application: ''
  });

  // Application codes
  const applicationCodes = [
    'abb', 'acp', 'aep', 'ami', 'amp', 'bpx', 'can', 'djd',
    'fcs', 'ibo', 'ikc', 'ino', 'lsg', 'mbr', 'nxn', 'osn',
    'rok', 'wso', 'xsf'
  ];

  // Application search state
  const [applicationSearch, setApplicationSearch] = useState('');
  const filteredApplications = applicationCodes.filter(app =>
      app.toLowerCase().includes(applicationSearch.toLowerCase())
  );

  // View file state
  const [showViewFileModal, setShowViewFileModal] = useState(false);
  const [selectedDeploymentFiles, setSelectedDeploymentFiles] = useState([]);
  const [selectedDeploymentName, setSelectedDeploymentName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleServiceInputChange = (e) => {
    setNewService({
      ...newService,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddDeploymentSubmit = async (e) => {
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

  const handleAddServiceSubmit = async (e) => {
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
      setSuccess(`Service "${res.data.service.name}" created successfully`);

      // Reset form and close modal
      setNewService({ name: '', description: '', application: '' });
      setApplicationSearch('');
      setShowAddServiceModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating service');
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
        if (filenameMatch && filenameMatch.length === 2) {
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
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Row className="mb-4">
          <Col>
            <h2>Services</h2>
          </Col>
          <Col className="text-end">
            <Button
                variant="danger"
                onClick={() => setShowAddServiceModal(true)}
            >
              <i className="fas fa-plus-circle me-2"></i> Add New Service
            </Button>
          </Col>
        </Row>

        <Card className="mb-4">
          <Card.Body>
            {services.length > 0 ? (
                <Table responsive hover>
                  <thead>
                  <tr>
                    <th>Name</th>
                    <th>Application</th>
                    <th>Description</th>
                    <th>Created At</th>
                  </tr>
                  </thead>
                  <tbody>
                  {services.map(service => (
                      <tr key={service.id}>
                        <td>{service.name}</td>
                        <td>{service.application || 'N/A'}</td>
                        <td>{service.description}</td>
                        <td>{new Date(service.created_at).toLocaleDateString()}</td>
                      </tr>
                  ))}
                  </tbody>
                </Table>
            ) : (
                <div className="text-center py-3">
                  <p>No services found</p>
                  <Button variant="danger" onClick={() => setShowAddServiceModal(true)}>
                    Add First Service
                  </Button>
                </div>
            )}
          </Card.Body>
        </Card>

        <Row className="mb-4">
          <Col>
            <h2>Deployment History</h2>
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

        {services.length === 0 && (
            <Alert variant="warning">
              You need to create a service before adding deployments.
            </Alert>
        )}

        <Card>
          <Card.Body>
            {deployments.length > 0 ? (
                <Table responsive hover>
                  <thead>
                  <tr>
                    <th>Service</th>
                    <th>Application</th>
                    <th>Version</th>
                    <th>Branch</th>
                    <th>Changes</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {deployments.map(deployment => (
                      <tr key={deployment.id}>
                        <td>{deployment.service_name}</td>
                        <td>
                          {deployment.application ? (
                              <span className="badge bg-danger">{deployment.application}</span>
                          ) : (
                              'N/A'
                          )}
                        </td>
                        <td>
                          <span className="badge bg-dark">{deployment.version}</span>
                        </td>
                        <td>
                          <span className="badge bg-info">{deployment.branch_name || 'main'}</span>
                        </td>
                        <td>{deployment.changes}</td>
                        <td>{new Date(deployment.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewFiles(deployment)}
                          >
                            View Files
                          </Button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </Table>
            ) : (
                <div className="text-center py-3">
                  <p>No deployments found</p>
                  {services.length > 0 && (
                      <Button variant="danger" onClick={() => setShowAddModal(true)}>
                        Add First Deployment
                      </Button>
                  )}
                </div>
            )}
          </Card.Body>
        </Card>

        {/* Add Service Modal */}
        <Modal show={showAddServiceModal} onHide={() => setShowAddServiceModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Service</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddServiceSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Service Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={newService.name}
                    onChange={handleServiceInputChange}
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
                    onChange={(e) => setApplicationSearch(e.target.value)}
                    className="mb-2"
                />
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  <Form.Select
                      name="application"
                      value={newService.application}
                      onChange={handleServiceInputChange}
                      required
                  >
                    <option value="">Select an application</option>
                    {filteredApplications.map(app => (
                        <option key={app} value={app}>
                          {app}
                        </option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newService.description}
                    onChange={handleServiceInputChange}
                    placeholder="Describe the service"
                    required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAddServiceModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Add Service
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Add Deployment Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Deployment</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddDeploymentSubmit}>
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
                        <td>{file.file_type}</td>
                        <td>{Math.round(file.file_size / 1024)} KB</td>
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
                <p>No files available for this deployment.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewFileModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};

export default Dashboard;