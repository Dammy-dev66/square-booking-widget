import { Client, Environment } from 'square';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { serviceName, barberName, price, duration } = req.body;

    if (!serviceName || !barberName || !price) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === 'sandbox'
        ? Environment.Sandbox
        : Environment.Production,
    });

    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      quickPay: {
        name: `${serviceName} with ${barberName}`,
        priceMoney: {
          amount: Math.round(price * 100), // Convert dollars to cents
          currency: 'USD'
        },
        locationId: process.env.SQUARE_LOCATION_ID,
      },
      checkoutOptions: {
        redirectUrl: process.env.REDIRECT_URL || 'https://silverfoxbarberco.com/booking-confirmed'
      }
    });

    res.status(200).json({ url: result.paymentLink.url });
  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({ 
      error: 'Unable to create checkout session',
      details: error.message 
    });
  }
}
