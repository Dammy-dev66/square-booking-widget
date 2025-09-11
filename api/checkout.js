// /api/checkout.js
import { Client } from "square";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT, // "sandbox"
    });

    const { serviceName, amount } = req.body;

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: Date.now().toString(),
      quickPay: {
        name: serviceName,
        priceMoney: {
          amount: amount * 100, // Square expects cents
          currency: "USD",
        },
        locationId: process.env.SQUARE_LOCATION_ID,
      },
    });

    res.status(200).json({ url: response.result.paymentLink.url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
}
