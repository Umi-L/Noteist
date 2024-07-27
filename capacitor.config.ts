import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.julianogrady.notist',
    appName: 'notist',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
