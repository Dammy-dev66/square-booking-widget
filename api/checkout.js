// api/checkout.js
import { Client, Environment } from "square";
import crypto from "crypto";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT?.toLowerCase() === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { serviceName, barberName, price, currency = "USD" } = req.body || {};

    if (!serviceName || !barberName || price == null) {
      return res
        .status(400)
        .json({ error: "Missing required fields: serviceName, barberName, price" });
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      console.error("Missing SQUARE_LOCATION_ID");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
      return res.status(400).json({ error: "Price must be a number" });
    }

    const amountCents = Math.round(numericPrice * 100);
    const idempotencyKey =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const payload = {
      idempotency_key: idempotencyKey,
      quick_pay: {
        name: `${serviceName} with ${barberName}`,
        price_money: {
          amount: amountCents,
          currency,
        },
        location_id: process.env.SQUARE_LOCATION_ID,
      },
    };

    const checkoutResponse = await client.checkoutApi.createPaymentLink(payload);

    if (checkoutResponse?.errors) {
      console.error("Square API returned errors:", checkoutResponse.errors);
      return res.status(500).json({ error: "Square API error", details: checkoutResponse.errors });
    }

    const url =
      checkoutResponse?.result?.paymentLink?.url ||
      checkoutResponse?.result?.payment_link?.url;

    if (!url) {
      console.error("createPaymentLink returned unexpected response:", checkoutResponse);
      return res.status(500).json({ error: "Failed to create checkout link" });
    }

    return res.status(200).json({ url });
  } catch (error) {
    console.error("Checkout API error:", error?.errors || error?.response || error);
    return res.status(500).json({ error: "Failed to create checkout link" });
  }
}
