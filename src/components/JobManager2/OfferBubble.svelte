<script>
    import BaseBubble from "./BaseBubble.svelte";
    
    export let event;

    let sats = 0;
    let offerMsg = "Kein Text";
    let backgroundColor = "#E8F4FA"; // Ein sanftes Blau
    let textColor = "#333333"; // Dunkelgrau für guten Kontrast
    let satsColor = "#4A90E2"; // Hervorstechendes Blau für Sats

    // Reaktive Anweisungen für die Event-Daten
    $: if (event && event.tags) {
        const sats_info = event.tags.find((tag) => tag[0] === "sats");
        sats = sats_info ? sats_info[1] : 0;
    }

    $: if (event) {
        offerMsg = event.content || "Keine Beschreibung verfügbar.";
    }
</script>

<BaseBubble event={event} {backgroundColor} {textColor}>
    <div class="offer-content">
        <h3 class="sats-amount" style="color: {satsColor};">{sats} Sats</h3>
        <p class="offer-msg">{offerMsg}</p>
    </div>
</BaseBubble>

<style>
    .offer-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 10px;
    }

    .sats-amount {
        font-weight: bold;
        margin-bottom: 5px;
    }

    .offer-msg {
        margin-top: 0;
        line-height: 1.4;
    }
</style>
