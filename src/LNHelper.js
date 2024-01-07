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
      throw new Error("Keine gültige Lightning-Adresse angegeben.");
    }

    const ln = new LightningAddress(lightningAddress);
    await ln.fetch();

    if (!ln.nostrPubkey) {
      throw new Error("Nostr-Pubkey für die Lightning-Adresse fehlt.");
    }

    const zapArgs = {
      satoshi: satoshi,
      comment: comment,
      relays: relays,
      e: eventId,
    };

    if (window.webln) {
      const ret = await ln.zap(zapArgs);
      console.log("ret:", ret);
      return ret;
    } else {
      // Alternatives Vorgehen, wenn WebLN nicht verfügbar ist
      const invoice = await ln.zapInvoice(zapArgs);
      console.log("Zap-Rechnung generiert:", invoice.paymentRequest);
      // Weitere Schritte zur Abwicklung der Zahlung
    }
  } catch (error) {
    console.error("Fehler beim Senden des Zaps:", error);
    throw error; // oder benutzerdefinierten Fehler werfen
  }
}
