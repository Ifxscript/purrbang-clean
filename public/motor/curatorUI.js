(function() {
    // curatorUI.js - Client side curation controls
    const SERVER_URL = "http://localhost:3000";

    // If seed is already injected (e.g. during headless generation), don't overwrite it
    if (window.HASH) {
        return;
    }

    // 1. Setup seed before motor.rr.js executes
    const urlParams = new URLSearchParams(window.location.search);
    let currentSeed = urlParams.get("seed");

    if (!currentSeed) {
        currentSeed = localStorage.getItem("curator_next_seed");
        if (!currentSeed) {
            currentSeed = Math.floor(Math.random() * 999999999999).toString();
        } else {
            localStorage.removeItem("curator_next_seed"); // consume it
        }
    }

    window.HASH = Number(currentSeed);

    // Exit early if loaded inside gallery iframe
    const isIframe = window.self !== window.top;
    if (isIframe) {
        // Just set the seed for the engine and stop running curator script
        return;
    }

    // 2. Create the HTML Curation HUD
    function createHUD(count, target) {
        const hud = document.createElement("div");
        hud.id = "curator-hud";
        hud.style.position = "fixed";
        hud.style.bottom = "10px";
        hud.style.right = "10px";
        hud.style.backgroundColor = "rgba(15, 15, 15, 0.95)";
        hud.style.color = "#fff";
        hud.style.padding = "6px 12px";
        hud.style.borderRadius = "6px";
        hud.style.fontFamily = "system-ui, -apple-system, sans-serif";
        hud.style.fontSize = "11px";
        hud.style.boxShadow = "0 2px 10px rgba(0,0,0,0.5)";
        hud.style.zIndex = "999999";
        hud.style.display = "flex";
        hud.style.alignItems = "center";
        hud.style.gap = "12px";
        hud.style.border = "1px solid #333";

        hud.innerHTML = `
            <div style="font-weight: bold; color: #0DB3D9;">CURATOR</div>
            <div>Seed: <span style="font-family: monospace; color: #F2D57E; font-weight: bold;">${currentSeed}</span></div>
            <div style="border-left: 1px solid #333; padding-left: 10px;">
                Saved: <span style="font-weight: bold; color: #1DCEB9;">${count}</span> / <strong>${target}</strong>
            </div>
            <div style="display: flex; gap: 4px; border-left: 1px solid #333; padding-left: 10px;">
                <button onclick="saveSeed()" style="background: #11796D; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold; font-size: 10px;">Save [S]</button>
                <button onclick="skipSeed()" style="background: #333; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">Skip [Space]</button>
                <button onclick="undoLast()" style="background: #9C2113; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">Undo [U]</button>
            </div>
        `;
        document.body.appendChild(hud);
    }

    // Fetch status from server on load
    async function init() {
        try {
            const res = await fetch(`${SERVER_URL}/status`);
            const data = await res.json();
            createHUD(data.count, data.target);
        } catch (e) {
            console.error("Could not connect to curator server. Make sure node server is running!", e);
            createHUD("ERR", 456);
        }
    }

    // Save current seed
    window.saveSeed = async function() {
        try {
            // Grab traits if they were populated by the engine
            const traits = window.traits || {};
            const res = await fetch(`${SERVER_URL}/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ seed: currentSeed, traits: traits })
            });
            const data = await res.json();
            if (data.success) {
                console.log("Saved successfully!");
                // Reload to get a new seed
                window.location.reload();
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            alert("Failed to contact server to save: " + e.message);
        }
    };

    // Skip to a new seed
    window.skipSeed = function() {
        window.location.reload();
    };

    // Undo last saved seed
    window.undoLast = async function() {
        try {
            const res = await fetch(`${SERVER_URL}/undo`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) {
            alert("Failed to contact server to undo: " + e.message);
        }
    };

    // Keyboard listeners
    window.addEventListener("keydown", (e) => {
        if (e.code === "KeyS") {
            saveSeed();
        } else if (e.code === "Space") {
            e.preventDefault();
            skipSeed();
        } else if (e.code === "KeyU") {
            undoLast();
        }
    });

    window.addEventListener("load", init);
})();
