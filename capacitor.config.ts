import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.julianogrady.noteist',
    appName: 'noteist',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
