// This file contains security configurations for bcrypt password hashing
const bcrypt = require('bcrypt');

// Function to hash a password
const hashPassword = async (password) => {
  try {
    // Generate a salt with 10 rounds (recommended for security/performance balance)
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);
    
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};

// Function to compare a password with a hash
const comparePassword = async (password, hash) => {
  try {
    console.log('Comparing password:', { password, hash });
    
    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, hash);
    
    console.log('Password comparison result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Password comparison failed');
  }
};

module.exports = {
  hashPassword,
  comparePassword
};
