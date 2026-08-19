const BACKEND_URL = 'https://www.as-ope-viajes.company'

export const config = {
  apiUrl: `${BACKEND_URL}/api`,
  webUrl: BACKEND_URL,
  stripe: {
    publishableKey: 'pk_test_51SmfrGJ4lb8aEBzQ6vsqXLlK5HSK0ycumxd6JypI9ZKWhRjb7xRQEStwJKGKzlhMrA3iN61fTlGJkAHIRl7mTQyu00tMGs4woY',
  },
  googleMaps: {
    apiKey: 'AIzaSyC-eV8KIUZCyX0uvXUs4V2biXct-7h8SsY',
  },
  defaultTenantId: 1,
  appScheme: 'asoperadora',
}

export default config
