import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.julianogrady.writeover',
  appName: 'writeover',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
