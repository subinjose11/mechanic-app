// Polyfills must be first
import 'react-native-url-polyfill/auto';

// Initialize Firebase app early (but not auth - that will be lazy loaded)
import './src/firebase/config';

import 'expo-router/entry';
