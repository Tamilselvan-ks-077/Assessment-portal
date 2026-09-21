import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AssessPulse Assessment Platform REST API',
    version: '1.0.0',
    description:
      'Production-grade REST API backend for AssessPulse online testing and assessment engine.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api/v1`,
      description: 'Local Development Server (v1)',
    },
    {
      url: `http://localhost:${env.PORT}/api`,
      description: 'Default API Endpoint',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ADMIN', 'TEST_CREATOR', 'PARTICIPANT'] },
          organization: { type: 'string' },
        },
      },
      Assessment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          accessCode: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'] },
          timeLimitMinutes: { type: 'integer' },
          passingScorePercentage: { type: 'integer' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          message: { type: 'string' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
});
