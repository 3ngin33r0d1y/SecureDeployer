import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';

const DeploymentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deployment, setDeployment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDeployment();
    }, [id]);

    const fetchDeployment = async () => {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');

            // Set headers
            const config = {
                headers: {
                    'x-auth-token': token
                }
            };

            const res = await axios.get(`/api/deployments/${id}`, config);
            setDeployment(res.data.deployment);
            setLoading(false);
        } catch (err) {
            setError('Error fetching deployment details');
            setLoading(false);
        }
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

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <h3>Loading deployment details...</h3>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={handleBack}>
                    Back to Deployments
                </Button>
            </Container>
        );
    }

    if (!deployment) {
        return (
            <Container className="mt-4">
                <Alert variant="warning">Deployment not found</Alert>
                <Button variant="secondary" onClick={handleBack}>
                    Back to Deployments
                </Button>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <h2>Deployment Details</h2>
                </Col>
                <Col className="text-end">
                    <Button variant="secondary" onClick={handleBack}>
                        Back to Deployments
                    </Button>
                </Col>
            </Row>

            <Card className="mb-4">
                <Card.Header>
                    <h4>
                        {deployment.service_name} - Version <Badge bg="dark">{deployment.version}</Badge>
                    </h4>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <p><strong>ID:</strong> {deployment.id}</p>
                            <p><strong>Service:</strong> {deployment.service_name}</p>
                            <p>
                                <strong>Application:</strong>{' '}
                                <Badge bg="secondary">{deployment.application || 'N/A'}</Badge>
                            </p>
                            <p><strong>Created By:</strong> {deployment.creator_email}</p>
                            <p><strong>Created At:</strong> {new Date(deployment.created_at).toLocaleString()}</p>
                        </Col>
                        <Col md={6}>
                            <p><strong>Changes:</strong></p>
                            <div className="p-3 bg-light rounded">
                                {deployment.changes}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>
                    <h4>Documentation Files</h4>
                </Card.Header>
                <Card.Body>
                    {deployment.files && deployment.files.length > 0 ? (
                        <Table responsive>
                            <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Type</th>
                                <th>Size</th>
                                <th>Uploaded By</th>
                                <th>Uploaded At</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {deployment.files.map(file => (
                                <tr key={file.id}>
                                    <td>{file.file_name}</td>
                                    <td>{file.file_type || 'Unknown'}</td>
                                    <td>
                                        {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'Unknown'}
                                    </td>
                                    <td>{file.uploader_email}</td>
                                    <td>{new Date(file.uploaded_at).toLocaleString()}</td>
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
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DeploymentDetail;
