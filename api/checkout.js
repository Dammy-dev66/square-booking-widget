// api/checkout.js
import { Client, Environment } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'sandbox' ? Environment.Sandbox : Environment.Production,
});

export default async function handler(req, res) {
  try {
    const { result } = await client.checkoutApi.createPaymentLink({
      idempotencyKey: new Date().getTime().toString(),
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: [
          {
            name: 'Test Service',
            quantity: '1',
            basePriceMoney: { amount: 2000, currency: 'USD' },
          },
        ],
      },
    });

    res.status(200).json({ url: result.paymentLink.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
