import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [
    {
      provide: 'FirebaseAdmin',
      useFactory: () => {
        let serviceAccount: admin.ServiceAccount;

        const serviceAccountPath = path.join(
          process.cwd(),
          'firebase-config.json',
        );
        if (fs.existsSync(serviceAccountPath)) {
          serviceAccount = JSON.parse(
            fs.readFileSync(serviceAccountPath, 'utf8'),
          );
        } else if (process.env.FIREBASE_CREDENTIALS) {
          serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        } else {
          throw new Error(
            'Firebase config not found. Please set FIREBASE_CREDENTIALS.',
          );
        }

        if (!admin.apps.length) {
          return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        }
        return admin.app();
      },
    },
    FirebaseService,
  ],
  exports: ['FirebaseAdmin', FirebaseService],
})
export class FirebaseModule {}
