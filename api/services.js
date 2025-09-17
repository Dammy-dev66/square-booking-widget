// api/services.js
import { Client, Environment } from "square";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT?.toLowerCase() === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

export default async function handler(req, res) {
  try {
    const { result } = await client.catalogApi.listCatalog(undefined, "ITEM");
    const services = (result.objects || []).map(obj => {
      const { id, item_data } = obj;
      return {
        id,
        name: item_data?.name,
        variations: (item_data?.variations || []).map(v => ({
          id: v.id,
          name: v.item_variation_data?.name,
          price: v.item_variation_data?.price_money?.amount,
          currency: v.item_variation_data?.price_money?.currency,
          duration: v.item_variation_data?.service_duration,
        })),
      };
    });

    return res.status(200).json({ services });
  } catch (error) {
    console.error("Services API error:", error?.errors || error?.response || error);
    return res.status(500).json({ error: "Failed to load services" });
  }
}
