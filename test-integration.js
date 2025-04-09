// Test script for Vault and S3 integration
const { authenticateWithAppRole, getDatabaseCredentials, getS3Credentials } = require('./server/config/vault');
const { initializeS3Connection, uploadFile } = require('./server/config/s3');
const pool = require('./server/config/db');
const fs = require('fs');
const path = require('path');

// Test file path
const testFilePath = path.join(__dirname, 'test-file.txt');

// Create a test file
fs.writeFileSync(testFilePath, 'This is a test file for S3 upload');

// Test bucket name
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'deployment-tracker';

async function runTests() {
  console.log('Starting integration tests...');
  
  try {
    // Test 1: Vault AppRole Authentication
    console.log('\n--- Test 1: Vault AppRole Authentication ---');
    const authResult = await authenticateWithAppRole();
    console.log('Authentication result:', authResult ? 'Success' : 'Failed');
    
    // Test 2: Fetch Database Credentials from Vault
    console.log('\n--- Test 2: Fetch Database Credentials from Vault ---');
    const dbCredentials = await getDatabaseCredentials();
    console.log('Database credentials retrieved:', Object.keys(dbCredentials).join(', '));
    
    // Test 3: Fetch S3 Credentials from Vault
    console.log('\n--- Test 3: Fetch S3 Credentials from Vault ---');
    const s3Credentials = await getS3Credentials();
    console.log('S3 credentials retrieved:', Object.keys(s3Credentials).join(', '));
    
    // Test 4: Database Connection with Vault Credentials
    console.log('\n--- Test 4: Database Connection with Vault Credentials ---');
    const client = await pool.connect();
    console.log('Database connection successful');
    const result = await client.query('SELECT NOW()');
    console.log('Database query result:', result.rows[0]);
    client.release();
    
    // Test 5: S3 Connection with Vault Credentials
    console.log('\n--- Test 5: S3 Connection with Vault Credentials ---');
    const s3Client = await initializeS3Connection();
    console.log('S3 connection initialized');
    
    // Test 6: S3 File Upload
    console.log('\n--- Test 6: S3 File Upload ---');
    const testFile = {
      path: testFilePath,
      mimetype: 'text/plain'
    };
    const s3Key = `test/test-file-${Date.now()}.txt`;
    const uploadResult = await uploadFile(testFile, S3_BUCKET_NAME, s3Key);
    console.log('File uploaded to S3:', uploadResult.Key);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    // Exit process
    process.exit(0);
  }
}

// Run the tests
runTests();
