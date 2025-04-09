// CORS configuration for the application
const corsOptions = {
  // Allow requests from any origin in development
  // In production, this should be restricted to specific domains
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com'] 
    : '*',
  
  // Allow the following HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // Allow the following headers in requests
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Cache preflight requests for 1 hour (3600 seconds)
  maxAge: 3600,
  
  // Pass the CORS preflight response to the next handler
  preflightContinue: false,
  
  // Return 204 No Content for preflight requests
  optionsSuccessStatus: 204
};

module.exports = corsOptions;
