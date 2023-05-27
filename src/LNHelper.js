export async function sendSatsLNurl(lnurl) {
    if (typeof window.webln !== "undefined") {
      await window.webln.enable();
      await webln.lnurl(lnurl);
    }
  }