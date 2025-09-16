// api/services.js
import { Client, Environment } from "square";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

export default async function handler(req, res) {
  try {
    const { result } = await client.catalogApi.listCatalog(undefined, "ITEM");
    const services = result.objects || [];
    return res.status(200).json({ services });
  } catch (error) {
    console.error("Services API error:", error);
    return res.status(500).json({ error: "Failed to load services" });
  }
}
