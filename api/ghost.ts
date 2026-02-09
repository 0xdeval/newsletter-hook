import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Labels, Response } from "./types.js";
import { PROVIDER } from "./webhook.js";

dotenv.config();

const GHOST_ADMIN_API_URL = process.env.GHOST_ADMIN_API_URL || "";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";


if ((!GHOST_ADMIN_API_URL || !ADMIN_API_KEY) && PROVIDER === "ghost") {
  throw new Error("GHOST_ADMIN_API_URL or ADMIN_API_KEY is not set");
}

const [keyId, secret] = ADMIN_API_KEY.split(":");

if (!keyId || !secret) {
  throw new Error("ADMIN_API_KEY must be in format 'keyId:secret'");
}

export const addGhostMember = async (
  email: string,
  name: string,
  labels: Labels[]
): Promise<Response> => {
  try {
    const token = jwt.sign({}, Buffer.from(secret, "hex"), {
      keyid: keyId,
      algorithm: "HS256",
      expiresIn: "5m",
      audience: "/v5/admin/",
    });

    const response = await fetch(
      `${GHOST_ADMIN_API_URL}/ghost/api/admin/members/`,
      {
        method: "POST",
        headers: {
          Authorization: `Ghost ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          members: [
            {
              name: name || email.split("@")[0],
              email,
              labels,
            },
          ],
        }),
      }
    );

    console.log("Response:", response);

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error("Ghost API error:", data);
      return { success: false, data };
    }

    console.log("Member added:", data.members[0]);
    return { success: true, data };
  } catch (err) {
    console.error("Error adding member:", err);
    return { success: false, data: err };
  }
};
