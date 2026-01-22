import '@testing-library/jest-native/extend-expect'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Mock Expo modules
jest.mock('expo-local-authentication', () => ({
    hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
    isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
    supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1])),
    authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
    AuthenticationType: {
        FINGERPRINT: 1,
        FACIAL_RECOGNITION: 2,
        IRIS: 3,
    },
}))

jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(() => Promise.resolve()),
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
}))

jest.mock('expo-speech', () => ({
    speak: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
}))

jest.mock('expo-av', () => ({
    Audio: {
        requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
        setAudioModeAsync: jest.fn(() => Promise.resolve()),
        Recording: {
            createAsync: jest.fn(() => Promise.resolve({
                recording: {
                    stopAndUnloadAsync: jest.fn(() => Promise.resolve()),
                    getURI: jest.fn(() => 'mock-uri'),
                },
            })),
        },
        RecordingOptionsPresets: {
            HIGH_QUALITY: {},
        },
    },
}))

jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    shareAsync: jest.fn(() => Promise.resolve()),
}))

jest.mock('expo-file-system', () => ({
    cacheDirectory: 'mock-cache-directory/',
    writeAsStringAsync: jest.fn(() => Promise.resolve()),
    deleteAsync: jest.fn(() => Promise.resolve()),
}))

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
