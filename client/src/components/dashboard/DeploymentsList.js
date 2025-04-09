import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const DeploymentsList = () => {
  const [deployments, setDeployments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState('all');

  // File view state
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [deploymentFiles, setDeploymentFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Get unique applications from deployments
  const applications = deployments.length > 0
      ? [...new Set(deployments.filter(d => d.application).map(d => d.application))]
      : [];

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

  const handleViewFiles = async (deployment) => {
    setSelectedDeployment(deployment);
    setLoadingFiles(true);
    setShowFileModal(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Set headers
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      const res = await axios.get(`/api/deployments/${deployment.id}`, config);
      setDeploymentFiles(res.data.files || []);
      setLoadingFiles(false);
    } catch (err) {
      setError('Error fetching deployment files');
      setLoadingFiles(false);
    }
  };

  const handleDownloadFile = async (fileId) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Set headers for file download
      const config = {
        headers: {
          'x-auth-token': token
        },
        responseType: 'blob'
      };

      const res = await axios.get(`/api/deployments/files/${fileId}`, config);

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;

      // Get filename from the file object
      const file = deploymentFiles.find(f => f.id === fileId);
      link.setAttribute('download', file.file_name);

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Error downloading file');
    }
  };

  // Filter deployments by service and application
  const filteredDeployments = deployments.filter(d => {
    const serviceMatch = selectedService === 'all' || d.service_id === parseInt(selectedService);
    const applicationMatch = selectedApplication === 'all' || d.application === selectedApplication;
    return serviceMatch && applicationMatch;
  });

  if (loading) {
    return (
        <Container className="mt-4">
          <div className="text-center">
            <h3>Loading deployments...</h3>
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
        <h2 className="mb-4">Deployments</h2>

        {/* Filters */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="align-items-center mb-3">
              <Col md={3}>
                <h5 className="mb-0">Filter by Service:</h5>
              </Col>
              <Col md={9}>
                <select
                    className="form-select"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="all">All Services</option>
                  {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                  ))}
                </select>
              </Col>
            </Row>

            {applications.length > 0 && (
                <Row className="align-items-center">
                  <Col md={3}>
                    <h5 className="mb-0">Filter by Application:</h5>
                  </Col>
                  <Col md={9}>
                    <Form.Group>
                      <select
                          className="form-select"
                          value={selectedApplication}
                          onChange={(e) => setSelectedApplication(e.target.value)}
                      >
                        <option value="all">All Applications</option>
                        {applications.map(app => (
                            <option key={app} value={app}>
                              {app}
                            </option>
                        ))}
                      </select>
                    </Form.Group>
                  </Col>
                </Row>
            )}
          </Card.Body>
        </Card>

        {/* Deployments List */}
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
                          {deployment.application ? (
                              <Badge bg="danger">{deployment.application}</Badge>
                          ) : (
                              'N/A'
                          )}
                        </td>
                        <td>
                          <Badge bg="dark">{deployment.version}</Badge>
                        </td>
                        <td>{deployment.changes}</td>
                        <td>{deployment.creator_email}</td>
                        <td>{new Date(deployment.created_at).toLocaleDateString()}</td>
                        <td>
                          <Button
                              variant="outline-dark"
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
                </div>
            )}
          </Card.Body>
        </Card>

        {/* View Files Modal */}
        <Modal show={showFileModal} onHide={() => setShowFileModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Deployment Files - {selectedDeployment?.service_name} v{selectedDeployment?.version}
              {selectedDeployment?.application && (
                  <span className="ms-2 badge bg-danger">{selectedDeployment.application}</span>
              )}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {loadingFiles ? (
                <div className="text-center py-3">
                  <p>Loading files...</p>
                </div>
            ) : deploymentFiles.length > 0 ? (
                <Table responsive hover>
                  <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded By</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {deploymentFiles.map(file => (
                      <tr key={file.id}>
                        <td>{file.file_name}</td>
                        <td>{file.file_type.toUpperCase()}</td>
                        <td>{(file.file_size / (1024 * 1024)).toFixed(2)} MB</td>
                        <td>{file.uploader_email}</td>
                        <td>
                          <Button
                              variant="outline-danger"
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
                <div className="text-center py-3">
                  <p>No files available for this deployment</p>
                </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowFileModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};

export default DeploymentsList;
