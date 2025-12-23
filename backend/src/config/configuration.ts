import { firestore } from "firebase-admin";

export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT!, 10) || 5432
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
  jwt: {
    jwtSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpires: process.env.JWT_ACCESS_EXPIRES,
    jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT,
    port: process.env.MINIO_PORT,
    useSSL: JSON.parse(process.env.MINIO_USE_SSL || "false"),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucket: process.env.MINIO_BUCKET
  }
});
