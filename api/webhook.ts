import type { Labels, Response } from "./types.js";
import { addGhostMember } from "./ghost.js";
import { addBeehiivMember } from "./beehiiv.js";
import { isDisposableEmail } from "../utils/disposable-emails.js";
import dotenv from "dotenv";

dotenv.config();

export const PROVIDER = process.env.PROVIDER

if (!PROVIDER) {
  throw new Error("PROVIDER is not set");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  const { email, labels, name } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      error: "Missing or invalid email or chain in request body",
    });
  }

  if (await isDisposableEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "Disposable email addresses are not allowed",
    });
  }

  let labelsToAdd: Labels[] = [];
  if (!labels) {
    labelsToAdd = [
      {
        name: "webhook-auto-import",
        slug: "webhook-auto-import",
      },
    ];
  } else {
    if (Array.isArray(labels)) {
      labelsToAdd = labels.map((label) => ({
        name: label,
        slug: label,
      }));
    } else {
      return res.status(400).json({
        success: false,
        error: "'labels' field must be an array of strings",
      });
    }
  }

  console.log("Adding a user with the following metadata:", {
    email,
    name,
    labels: labelsToAdd,
  });

  let response
  if (PROVIDER === 'ghost') {
    response = (await addGhostMember(email, name, labelsToAdd)) as Response;
  } else {
    response = (await addBeehiivMember(email, name, labelsToAdd)) as Response;
  }


  if (response.success) {
    res.status(200).json({
      success: true,
      message: "Member added successfully",
    });
  } else {
    res.status(500).json({
      success: false,
      error: response.data.errors,
    });
  }
}
