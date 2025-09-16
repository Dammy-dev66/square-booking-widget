// api/checkout.js
import { Client, Environment } from "square";
import crypto from "crypto";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serviceName, barberName, price } = req.body;

    if (!serviceName || !barberName || !price) {
      return res.status(400).json({ error: "Missing checkout details" });
    }

    const checkoutResponse = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: `${serviceName} with ${barberName}`,
        priceMoney: {
          amount: parseInt(price * 100), // convert dollars to cents
          currency: "USD",
        },
        locationId: process.env.SQUARE_LOCATION_ID,
      },
    });

    return res
      .status(200)
      .json({ url: checkoutResponse.result.paymentLink.url });
  } catch (error) {
    console.error("Checkout API error:", error);
    return res.status(500).json({ error: "Failed to create checkout link" });
  }
}
