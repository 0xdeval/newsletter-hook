import type { Labels } from "./types.js";
import dotenv from "dotenv";
import { PROVIDER } from "./webhook.js";

dotenv.config();

const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID || "";
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY || "";

if ((!BEEHIIV_PUB_ID || !BEEHIIV_API_KEY) && PROVIDER === "beehiiv") {
    throw new Error("BEEHIIV_PUB_ID or BEEHIIV_API_KEY is not set");
}

export const addBeehiivMember = async (email: string,
    name: string,
    labels: Labels[]) => {

    const hostname = "https://api.beehiiv.com/"

    try {

        const response = await fetch(
            `${hostname}/v2/publications/${BEEHIIV_PUB_ID}/subscriptions `,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${BEEHIIV_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "custom_fields": [
                        {
                            "name": "full_name",
                            "value": name || email.split("@")[0]
                        },
                        ...labels.map((label) => ({
                            "name": label.name,
                            "value": label.slug
                        }))
                    ],
                    "email": email
                }),
            }
        );

        console.log("Response:", response);

        const data = (await response.json()) as any;

        if (!response.ok) {
            console.error("Beehiiv API error:", data);
            return { success: false, data };
        }

        console.log("Member added:", data);
        return { success: true, data };
    } catch (err) {
        console.error("Error adding member:", err);
        return { success: false, data: err };
    }

}