import fetch from 'node-fetch'

async function getUPSOAuthToken(clientID, clientSecret, merchantID) {

    const formData = {
        grant_type: 'client_credentials'
    };

    const resp = await fetch(
        `https://onlinetools.ups.com/security/v1/oauth/token`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-merchant-id': `${merchantID}`,
                Authorization: 'Basic ' + Buffer.from(`${clientID}:${clientSecret}`).toString('base64')
            },
            body: new URLSearchParams(formData).toString()
        }
    );

    const data = await resp.json();
    return data['access_token'];
}


async function getShippingStatus(upsAccessToken, upsTrackingNumber) {
    const query = new URLSearchParams({
            locale: 'en_US',
            returnSignature: 'false'
        }).toString();

        const inquiryNumber = `${upsTrackingNumber}`;
        const resp = await fetch(
            `https://onlinetools.ups.com/api/track/v1/details/${inquiryNumber}?${query}`,
            {
                method: 'GET',
                headers: {
                    transId: '12345678901234567890123456789012',
                    transactionSrc: 'testing',
                    Authorization: `Bearer ${upsAccessToken}`
                }
            }
        );
        const data = await resp.json();
        const statusCode = data?.trackResponse?.shipment?.[0]?.package?.[0]?.activity?.[0]?.status?.statusCode;
        const deliveryDate = data?.trackResponse?.shipment?.[0]?.package?.[0]?.deliveryDate?.[0]?.date;

        return {
            statusCode: statusCode,
            deliveryDate: deliveryDate
        };    }

async function main() {
    try {
        let clientID = 'your-client-id';
        let clientSecret = 'your-client-secret';
        let merchantID = 'your-merchant-id';
        let upsTrackingNumber = 'your-tracking-number';
        const upsAccessToken = await getUPSOAuthToken(clientID, clientSecret, merchantID);
        const upsPackageInformation = await getShippingStatus(upsAccessToken, upsTrackingNumber);

        console.log("Package Info:", upsPackageInformation);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();

