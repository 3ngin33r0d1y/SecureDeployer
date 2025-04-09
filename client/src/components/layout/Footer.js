import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 py-3">
      <Container className="text-center">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Deployment Tracker | All Rights Reserved
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
