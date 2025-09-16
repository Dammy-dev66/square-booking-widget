// api/team-members.js
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
    const { result } = await client.teamApi.listTeamMembers();
    const teamMembers = result.teamMembers || [];
    return res.status(200).json({ teamMembers });
  } catch (error) {
    console.error("Team Members API error:", error);
    return res.status(500).json({ error: "Failed to load team members" });
  }
}
