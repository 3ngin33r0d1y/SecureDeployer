import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Set headers
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      
      const res = await axios.get('/api/users', config);
      setUsers(res.data.users);
      setLoading(false);
    } catch (err) {
      setError('Error fetching users');
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
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
      
      await axios.delete(`/api/users/${userToDelete.id}`, config);
      
      // Update users list
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      // Show success message
      setDeleteSuccess(`User ${userToDelete.email} deleted successfully`);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
      
      // Close modal
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError('Error deleting user');
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <h3>Loading users...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>User Management</h2>
        </Col>
        <Col className="text-end">
          <Button variant="danger" href="/admin/register">
            <i className="fas fa-user-plus me-2"></i> Add New User
          </Button>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}
      
      <Card>
        <Card.Body>
          {users.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
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
                        onClick={() => handleDeleteClick(user)}
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
              <p>No users found</p>
              <Button variant="danger" href="/admin/register">
                Add First User
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user <strong>{userToDelete?.email}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersList;
