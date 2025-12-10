import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API Documentation for Task Management System',
      contact: {
        name: 'Developer',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
    ],
  },
  // PENTING: Arahkan ke file routes Anda agar komentar dibaca
  apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;