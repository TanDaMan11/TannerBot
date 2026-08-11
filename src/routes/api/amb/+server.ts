/** Webhook endpoint for legacy Apple Business Chat and Sinch MESSAGE_INBOUND events. */
import type { RequestEvent } from "@sveltejs/kit";
import { json } from "../../../lib/sveltekit";

type JsonObject = Record<string, unknown>;

const DEFAULT_REPLY =
  "Text Tanner Scarlett to check in on his reading and let him know if the game is ready.";

function asObject(value: unknown): JsonObject | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined;
}

function read(value: unknown, key: string): unknown {
  return asObject(value)?.[key];
}

function readString(value: unknown, key: string): string | undefined {
  const result = read(value, key);
  return typeof result === "string" && result.trim() ? result.trim() : undefined;
}

function getBotReply(text: string): string {
  const normalized = text.trim().toLowerCase();
  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized)) {
    return "Hi! I’m Tanner’s friendly check-in bot. How can I help?";
  }
  if (
    normalized.includes("who are you") ||
    normalized.includes("what are you") ||
    normalized === "about"
  ) {
    return "I’m Tanner Scarlett’s friendly check-in bot. I can help keep him posted on your message.";
  }
  return DEFAULT_REPLY;
}

function hasSinchCredentials(): boolean {
  return Boolean(
    process.env.SINCH_PROJECT_ID &&
      process.env.SINCH_APP_ID &&
      process.env.SINCH_ACCESS_KEY &&
      process.env.SINCH_ACCESS_KEY_SECRET
  );
}

function extractSinchMessage(payload: JsonObject): {
  text?: string;
  identity?: string;
  channel?: string;
} {
  const message = asObject(payload.message) ?? {};
  const contactMessage = asObject(message.contact_message) ?? {};
  const textMessage = asObject(contactMessage.text_message);
  const channelIdentity =
    asObject(contactMessage.channel_identity) ?? asObject(message.channel_identity);

  return {
    text: readString(textMessage, "text"),
    identity:
      readString(channelIdentity, "identity") ??
      readString(message, "sender_id") ??
      readString(message, "contact_id"),
    channel:
      readString(channelIdentity, "channel") ??
      readString(message, "channel") ??
      readString(message, "conversation_channel")
  };
}

async function sendSinchReply(
  identity: string,
  channel: string,
  text: string
): Promise<void> {
  const projectId = process.env.SINCH_PROJECT_ID as string;
  const appId = process.env.SINCH_APP_ID as string;
  const accessKey = process.env.SINCH_ACCESS_KEY as string;
  const accessKeySecret = process.env.SINCH_ACCESS_KEY_SECRET as string;
  const authorization = btoa(`${accessKey}:${accessKeySecret}`);

  const response = await fetch(
    `https://us.conversation.api.sinch.com/v1/projects/${encodeURIComponent(projectId)}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authorization}`
      },
      body: JSON.stringify({
        app_id: appId,
        recipient: {
          identified_by: {
            channel_identities: [{ channel, identity }]
          }
        },
        message: { text_message: { text } }
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Sinch returned HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
  }
}

export const POST = async ({ request }: RequestEvent): Promise<Response> => {
  let payload: JsonObject;
  try {
    const parsed: unknown = await request.json();
    payload = asObject(parsed) ?? {};
  } catch (error: unknown) {
    console.warn("[amb] Could not parse inbound JSON", {
      error: error instanceof Error ? error.message : String(error)
    });
    return json({ message: { text: "" } }, { status: 200 });
  }

  const message = asObject(payload.message) ?? {};
  const eventType = readString(payload, "event_type") ?? readString(payload, "type");
  const sinch = extractSinchMessage(payload);
  const isSinch = eventType === "MESSAGE_INBOUND" || sinch.text !== undefined;
  const appleTextValue = read(message.text, "body") ?? message.text;
  const incoming = String(isSinch ? sinch.text ?? "" : appleTextValue ?? "").trim();
  const botReply = getBotReply(incoming);

  if (isSinch) {
    console.info("[amb] Extracted Sinch inbound message", {
      text: incoming,
      identity: sinch.identity,
      channel: sinch.channel
    });

    if (hasSinchCredentials() && sinch.identity && sinch.channel) {
      try {
        await sendSinchReply(sinch.identity, sinch.channel, botReply);
        console.info("[amb] Sinch outbound successful");
      } catch (error: unknown) {
        console.error("[amb] Sinch outbound failed", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      console.info("[amb] Sinch outbound skipped", {
        credentialsAvailable: hasSinchCredentials(),
        hasIdentity: Boolean(sinch.identity),
        hasChannel: Boolean(sinch.channel)
      });
    }

    // Sinch only needs an acknowledgement; the reply is sent through its API.
    return json({ ok: true }, { status: 200 });
  }

  // Apple Business Chat expects the reply in the webhook response.
  return json({ message: { text: botReply } }, { status: 200 });
};
