
require('dotenv').config({ path: '.env.local' });

async function testAmadeus() {
    const clientId = process.env.AMADEUS_API_KEY;
    const clientSecret = process.env.AMADEUS_API_SECRET;

    console.log('--- Testing Amadeus Connection ---');
    console.log('Client ID set:', !!clientId);
    console.log('Client Secret set:', !!clientSecret);
    console.log('Environment:', process.env.AMADEUS_ENVIRONMENT || 'unknown (defaulting to sandbox)');

    if (!clientId || !clientSecret) {
        console.error('❌ Missing credentials. Cannot test.');
        return;
    }

    try {
        const authUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
        console.log('Authenticating against:', authUrl);

        const response = await fetch(authUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            })
        });

        if (!response.ok) {
            console.error('❌ Auth failed:', await response.text());
            return;
        }

        const data = await response.json();
        console.log('✅ Authentication successful! Token received.');
        const token = data.access_token;

        // Test Hotel Search
        const cityCode = 'CUN';
        console.log(`Searching hotels in ${cityCode}...`);

        const searchUrl = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`;
        const searchRes = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!searchRes.ok) {
            console.error('❌ Hotel Search 1 failed:', await searchRes.text());
            // Try without radius/source if maybe version mismatch
            return;
        }

        const searchData = await searchRes.json();
        const hotels = searchData.data || [];
        console.log(`✅ Found ${hotels.length} hotels in ${cityCode}`);

        if (hotels.length > 0) {
            const hotelIds = hotels.slice(0, 5).map(h => h.hotelId).join(',');
            console.log(`Checking offers for first 5 hotels: ${hotelIds}`);

            const offersUrl = `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=2`;
            const offersRes = await fetch(offersUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!offersRes.ok) {
                console.error('❌ Offers search failed:', await offersRes.text());
            } else {
                const offersData = await offersRes.json();
                console.log(`✅ Found ${offersData.data ? offersData.data.length : 0} offers.`);
            }
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testAmadeus();
