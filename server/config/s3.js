const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const { getS3Credentials } = require('./vault');

// Default S3 configuration with placeholder values
// These will be replaced with values from Vault when available
let s3Config = {
  accessKeyId: process.env.S3_ACCESS_KEY || 'placeholder',
  secretAccessKey: process.env.S3_SECRET_KEY || 'placeholder',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  s3ForcePathStyle: true, // Required for Scality S3
  signatureVersion: 'v4',
  region: process.env.S3_REGION || 'us-east-1'
};

// Initialize S3 client with default config
let s3Client = new AWS.S3(s3Config);

// Initialize S3 connection with credentials from Vault
async function initializeS3Connection() {
  try {
    // Get S3 credentials from Vault
    const s3Credentials = await getS3Credentials();
    
    // Update S3 configuration with credentials from Vault
    s3Config = {
      accessKeyId: s3Credentials.S3_ACCESS_KEY,
      secretAccessKey: s3Credentials.S3_SECRET_KEY,
      endpoint: s3Credentials.S3_ENDPOINT,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      region: s3Credentials.S3_REGION || 'us-east-1'
    };
    
    // Create new S3 client with updated config
    s3Client = new AWS.S3(s3Config);
    
    console.log('S3 connection initialized with credentials from Vault');
    return s3Client;
  } catch (error) {
    console.error('Error initializing S3 connection with Vault credentials:', error.message);
    console.log('Falling back to environment variables for S3 connection');
    
    // If Vault authentication fails, we'll continue using the environment variables
    return s3Client;
  }
}

// Upload a file to S3
async function uploadFile(file, bucketName, key) {
  try {
    const fileContent = fs.readFileSync(file.path);
    
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype
    };
    
    const data = await s3Client.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
    return data;
  } catch (error) {
    console.error('Error uploading file to S3:', error.message);
    throw error;
  }
}

// Download a file from S3
async function downloadFile(bucketName, key, destinationPath) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    const data = await s3Client.getObject(params).promise();
    fs.writeFileSync(destinationPath, data.Body);
    console.log(`File downloaded successfully to ${destinationPath}`);
    return destinationPath;
  } catch (error) {
    console.error('Error downloading file from S3:', error.message);
    throw error;
  }
}

// Delete a file from S3
async function deleteFile(bucketName, key) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    await s3Client.deleteObject(params).promise();
    console.log(`File deleted successfully. Bucket: ${bucketName}, Key: ${key}`);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error.message);
    throw error;
  }
}

// Generate a pre-signed URL for temporary access to a file
async function getSignedUrl(bucketName, key, expiresIn = 3600) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn
    };
    
    const url = await s3Client.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error.message);
    throw error;
  }
}

// Initialize the S3 connection when this module is imported
initializeS3Connection().catch(err => {
  console.error('Failed to initialize S3 connection:', err.message);
});

module.exports = {
  s3Client,
  uploadFile,
  downloadFile,
  deleteFile,
  getSignedUrl,
  initializeS3Connection
};
