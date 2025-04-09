const vault = require('node-vault');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Vault client configuration
const vaultConfig = {
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
  // Default to empty token, will be set after authentication
  token: ''
};

// Initialize Vault client
const vaultClient = vault(vaultConfig);

// AppRole authentication
async function authenticateWithAppRole() {
  try {
    const roleId = process.env.VAULT_ROLE_ID;
    const secretId = process.env.VAULT_SECRET_ID;
    
    if (!roleId || !secretId) {
      throw new Error('Vault AppRole credentials not found in environment variables');
    }
    
    const result = await vaultClient.approleLogin({
      role_id: roleId,
      secret_id: secretId
    });
    
    // Set the token in the client
    vaultClient.token = result.auth.client_token;
    
    console.log('Successfully authenticated with Vault using AppRole');
    return true;
  } catch (error) {
    console.error('Vault authentication error:', error.message);
    throw error;
  }
}

// Get database credentials from Vault
async function getDatabaseCredentials() {
  try {
    // Ensure we're authenticated
    if (!vaultClient.token) {
      await authenticateWithAppRole();
    }
    
    // Path where database credentials are stored in Vault
    const dbCredentialsPath = 'XXX/deployment-tracker/int/default/database';
    
    const { data } = await vaultClient.read(dbCredentialsPath);
    
    // Return the database credentials
    return data.data;
  } catch (error) {
    console.error('Error fetching database credentials from Vault:', error.message);
    throw error;
  }
}

// Get S3 credentials from Vault
async function getS3Credentials() {
  try {
    // Ensure we're authenticated
    if (!vaultClient.token) {
      await authenticateWithAppRole();
    }
    
    // Path where S3 credentials are stored in Vault
    const s3CredentialsPath = 'XXX/deployment-tracker/int/default/s3';
    
    const { data } = await vaultClient.read(s3CredentialsPath);
    
    // Return the S3 credentials
    return data.data;
  } catch (error) {
    console.error('Error fetching S3 credentials from Vault:', error.message);
    throw error;
  }
}

module.exports = {
  vaultClient,
  authenticateWithAppRole,
  getDatabaseCredentials,
  getS3Credentials
};
