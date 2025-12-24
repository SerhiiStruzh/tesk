# Technology Stack

**Backend**: NestJS + TypeScript + Prisma
**Frontend**: React
**Database**: PostgreSQL
**Storage**: MinIO (S3-compatible)
**Auth**: Google OAuth via Firebase Authentication
**Containerization**: Docker + docker-compose

# Google OAuth Setup (Firebase)
1. Create a project in the Firebase Console.
2. Enable Google Auth in the Authentication > Sign-in method section.
3. Register a Web App in Project Settings to obtain the frontend configuration.
4. Generate a Service Account JSON in Project Settings > Service Accounts and extract credentials for the backend.
5. Add the acquired credentials to the environment variables in the docker-compose.yml file.

## Execution
1. Configure environment variables in `.env` files.
2. Start the infrastructure:
   ```bash
   docker-compose up -d
3. The application will be available at http://localhost:80.