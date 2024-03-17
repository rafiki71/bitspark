import { LightningAddress } from "@getalby/lightning-tools";
import "websocket-polyfill";

export async function sendSatsLNurl(lnurl) {
  if (typeof window.webln !== "undefined") {
    await window.webln.enable();
    await webln.lnurl(lnurl);
  }
}

export async function sendZap(lightningAddress, satoshi, comment, relays, eventId) {
  try {
    if (!lightningAddress) {
      throw new Error("No valid lightning address provided.");
    }

    const ln = new LightningAddress(lightningAddress);
    await ln.fetch();

    if (!ln.nostrPubkey) {
      throw new Error("Nostr pubkey missing for the lightning address.", lightningAddress);
    }

    const zapArgs = {
      satoshi: satoshi,
      comment: comment,
      relays: relays,
      e: eventId,
    };

    if (window.webln) {
      const ret = await ln.zap(zapArgs);
      return ret;
    } else {
      // Alternative approach if WebLN is not available
      const invoice = await ln.zapInvoice(zapArgs);
      console.log("Zap invoice generated:", invoice.paymentRequest);
      // Further steps for payment processing
    }
  } catch (error) {
    console.error("Error sending the Zap:", error);
    throw error; // or throw custom error
  }
}
