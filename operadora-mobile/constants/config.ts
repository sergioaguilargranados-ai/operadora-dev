const ENV = {
    dev: {
        apiUrl: 'http://192.168.100.8:3000/api',
        webUrl: 'http://192.168.100.8:3000',
    },
    staging: {
        apiUrl: 'https://operadora-dev-preview.vercel.app/api',
        webUrl: 'https://operadora-dev-preview.vercel.app',
    },
    prod: {
        apiUrl: 'https://app.asoperadora.com/api',
        webUrl: 'https://app.asoperadora.com',
    },
}

const getEnvVars = () => {
    // En desarrollo, usar localhost
    if (__DEV__) {
        return ENV.dev
    }
    // En producción, cambiar según el ambiente
    return ENV.staging
}

export default getEnvVars()
