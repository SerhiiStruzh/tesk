import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [
    ConfigModule
  ],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        const firebaseConf = configService.get('firebase');

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: firebaseConf.projectId,
              privateKey: firebaseConf.privateKey,
              clientEmail: firebaseConf.clientEmail,
            }),
          });
        }

        return admin;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
