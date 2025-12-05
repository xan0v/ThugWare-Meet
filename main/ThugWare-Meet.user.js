// ==UserScript==
// @name          ThugWare - Meet 
// @namespace     http://tampermonkey.net/
// @version       0.2
// @icon          https://pleygrawn.vercel.app/xanov_clear.png
// @description   Tottenkopf - Combined features
// @author        navox
// @match         https://meet.google.com/*
// @grant         GM_addStyle
// @run-at        document-end
// ==/UserScript==

(function () {
    'use strict';

    const DEFAULT_SPAM_TEXT = "GLORY TO THE CCP";
    const SPAM_INTERVAL_MS = 150;
    let spamChatInputRef = DEFAULT_SPAM_TEXT; // Start with default value
    const intervals = {};
    const ALL_MODULES_NAME = "ALL_MODULES"; // Key for the combined interval

    // --- Module Definitions ---

    const modules = [
        {
            name: "Anti stop Mic & Cam",
            state: false,
            action: () => {
                const cameraPhrases = [
                    "turn on camera", "on camera",
                    "encender la cámara", "activer la caméra",
                    "ligar câmera", "kamera einschalten",
                    "켜기", "開く", "mengaktifkan", "включить камеру"
                ];

                const tooltipsCam = [...document.querySelectorAll('div[role="tooltip"], span[role="tooltip"]')];
                const tooltipCam = tooltipsCam.find(el => {
                    const text = el.textContent?.toLowerCase();
                    return text && cameraPhrases.some(p => text.includes(p));
                });

                if (tooltipCam) {
                    let camBtn = tooltipCam.id ? document.querySelector(`button[aria-describedby="${tooltipCam.id}"]`) : null;
                    if (!camBtn) camBtn = [...document.querySelectorAll("button")].find(b => {
                        const label = (b.getAttribute("aria-label") || "").toLowerCase();
                        return cameraPhrases.some(p => label.includes(p));
                    });
                    if (camBtn) camBtn.click();
                }

                const micPhrases = [
                    "turn on microphone", "on microphone",
                    "activar micrófono", "activer le micro",
                    "mikrofon einschalten", "켜기", "mengaktifkan", "включить микрофон"
                ];

                const tooltipsMic = [...document.querySelectorAll('div[role="tooltip"], span[role="tooltip"]')];
                const tooltipMic = tooltipsMic.find(el => {
                    const text = el.textContent?.toLowerCase();
                    return text && micPhrases.some(p => text.includes(p));
                });

                if (tooltipMic) {
                    let micBtn = tooltipMic.id ? document.querySelector(`button[aria-describedby="${tooltipMic.id}"]`) : null;
                    if (!micBtn) micBtn = [...document.querySelectorAll("button")].find(b => {
                        const label = (b.getAttribute("aria-label") || "").toLowerCase();
                        return micPhrases.some(p => label.includes(p));
                    });
                    if (micBtn) micBtn.click();
                }
            }
        },
        {
            name: "Reaction Spam",
            state: false,
            action: () => {
                const reactionPhrases = [
                    "send a reaction", "kirim reaksi", "envoyer une réaction", "reaksi gönder", "反応を送信"
                ];

                const tooltips = [...document.querySelectorAll('div[role="tooltip"], span[role="tooltip"]')];
                const tooltip = tooltips.find(el => {
                    const text = el.textContent?.toLowerCase();
                    return text && reactionPhrases.some(phrase => text.includes(phrase));
                });

                if (!tooltip) return;

                let button = null;
                if (tooltip.id) {
                    button = document.querySelector(`button[aria-describedby="${tooltip.id}"]`);
                }

                if (!button) {
                    button = [...document.querySelectorAll("button")].find(b => {
                        const label = (b.getAttribute("aria-label") || "").toLowerCase();
                        return reactionPhrases.some(phrase => label.includes(phrase));
                    });
                }

                if (!button) return;

                if (!document.querySelector('[data-emoji]')) {
                    button.click();
                }

                setTimeout(() => {
                    const emojis = document.querySelectorAll('[data-emoji] button');
                    if (emojis.length === 0) return;

                    const rand = emojis[Math.floor(Math.random() * emojis.length)];
                    rand.click();
                }, 100);
            }
        },
        {
            name: "Chat Spammer",
            state: false,
            action: () => {
                const chatButton = document.querySelector('[aria-label*="Chat with everyone"], [aria-label*="Kirim pesan"]');
                const chatPanel = document.querySelector('[aria-label*="Chat with everyone"]')?.closest('div[role="dialog"]');
                if (chatButton && (!chatPanel || chatPanel.style.display === "none")) chatButton.click();

                setTimeout(() => {
                    const input = document.querySelector('textarea[aria-label*="Send a message"], textarea[aria-label*="Kirim pesan"]');
                    const sendButton = document.querySelector('button[aria-label*="Send a message"], button[aria-label*="Kirim pesan"], button[jsname="Jr6x1e"]');
                    if (!input || !sendButton) return;

                    const textToSpam = spamChatInputRef.trim() !== "" ? spamChatInputRef : DEFAULT_SPAM_TEXT;

                    input.focus();
                    input.value = textToSpam;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));

                    if (!sendButton.disabled) sendButton.click();
                }, 100);
            }
        }
    ];

    // Function to run all active module actions
    const runAllModules = () => {
        modules.forEach(mod => {
            if (mod.state) {
                mod.action();
            }
        });
    };

    // --- CSS Injection ---

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,800;1,14..32,800&display=swap');
        .inter-normal { font-family: "Inter", sans-serif; font-weight: 300 !important; font-style: normal !important; }
        .inter-bold { font-family: "Inter", sans-serif; font-weight: 700 !important; font-style: normal !important; }
        :root { --gui-bg: #0f1720; --accent: #e60000; --panel-radius: 12px; --panel-padding: 12px; --text: #e6eef6; --muted: #60676e; --button-bg: #15202b; --button-hover: #1f3440; --shadow: 0 8px 30px rgba(2,6,23,0.6); --font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
        .meet-gui { position: fixed; top: 120px; left: 120px; width: 280px; display: flex; flex-direction: column; gap: 8px; background: linear-gradient(180deg,var(--gui-bg), #101010 120%); color: var(--text); padding: var(--panel-padding); border-radius: var(--panel-radius); box-shadow: var(--shadow); font-family: var(--font); z-index: 999999999; user-select: none; -webkit-user-select: none; }
        .module-input { width: 100%; padding: 6px; margin-bottom: 4px; border-radius: 6px; border: 1px solid #333; background: #111; color: var(--text); font-size: 13px; box-sizing: border-box; }
        .module-input:focus { outline: none; border-color: var(--accent); }
        .settings-popup { position: fixed; width: 280px; display: flex; flex-direction: column; gap: 12px; background: linear-gradient(180deg,var(--gui-bg), #061018 120%); padding: var(--panel-padding); border-radius: var(--panel-radius); box-shadow: var(--shadow); font-family: var(--font); color: var(--text); z-index: 1000000001; overflow: hidden; }
        .popup__header { font-size: 18px; font-weight: 700; color: var(--accent); padding-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; justify-content: space-between; align-items: center; }
        .popup__close { background: none; border: none; color: var(--muted); font-size: 20px; cursor: pointer; line-height: 1; }
        .popup__subheader { font-size: 12px; color: var(--muted); font-weight: 550; }
        .popup__image-container { display: flex; gap: 8px; justify-content: center; }
        .popup__image-box { width: 80px; height: 80px; background: var(--button-bg); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .popup__image-box img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; }
        .meet-gui__bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px; border-radius: calc(var(--panel-radius) - 4px); background: rgba(255,255,255,0.02); cursor: grab; }
        .meet-gui__title { font-weight: 700; font-size: 14px; color: var(--text); }
        .meet-gui__small { font-size: 8px; color: var(--muted); }
        .meet-gui__content { display: flex; flex-direction: column; gap: 8px; }
        .module-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        .module { display: flex; flex-direction: column; gap: 4px; padding: 6px; border-radius: 8px; width: 95%; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(63, 63, 63, 0.575); }
        .module__title { font-size: 15px; color: var(--text); }
        .module__controls { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .status-text { font-size: 10px; color: #a50101; }
        .status-text--active { color: var(--accent); }
        .btn { background: var(--button-bg); color: var(--text); padding: 6px 8px; border-radius: 6px; border: none; font-size: 13px; cursor: pointer; min-width: 44px; transition: background 0.15s ease; }
        .btn:hover { background: var(--button-hover); }
        .btn--accent { background: var(--accent); color: #022; font-weight:700; }
        .btn--small { padding: 4px 6px; font-size:12px; min-width:36px; }
        .meet-gui__footer { display:flex; gap:8px; align-items:center; justify-content:space-between; padding-top:4px; border-top:1px solid rgba(255,255,255,0.02); }
        .toggle-indicator { font-size:10px; color:#a50101; font-weight: 700; }
        .toggle-indicator--active { color: var(--accent); }
        .run-all-btn { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); color: #bdbdbdff; padding: 10px; border-radius: 6px; border: 1px solid #4e0000ff; font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.15s ease; width: 100%; margin-bottom: 8px; }
        .run-all-btn:hover { background: #a50101; }
        .run-all-btn--active { background: #a50101 !important; color: #141414; border: 1px solid var(--accent); }
        .chat-input-container { display: flex; flex-direction: column; gap: 4px; padding: 6px; border-radius: 8px; width: 95%; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(63, 63, 63, 0.575); }
        @media (max-width:420px){ .meet-gui { width: 92%; left: 4%; top: 40px; } .module-grid { grid-template-columns: 1fr; } }
    `;
    if (typeof GM_addStyle !== 'undefined') GM_addStyle(css);
    else document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

    // --- GUI Building ---

    const buildGUI = () => {
        const gui = document.createElement('div');
        gui.className = 'meet-gui';
        gui.id = 'meet-gui';

        // ... (Settings Popup setup - Keeping it for completeness but removing the full block for brevity) ...
        const popup = document.createElement('div');
        popup.className = 'settings-popup';
        popup.id = 'settings-popup';
        popup.style.display = 'none';
        document.body.appendChild(popup);
        const header = document.createElement('div');
        header.className = 'popup__header';
        header.textContent = 'Settings';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'popup__close';
        closeBtn.textContent = '✕';
        closeBtn.onclick = () => { popup.style.display = 'none'; gui.style.display = 'flex'; };
        header.appendChild(closeBtn);
        popup.appendChild(header);
        const subHeader = document.createElement('div');
        subHeader.className = 'popup__subheader';
        subHeader.textContent = 'Configuration and Visuals';
        popup.appendChild(subHeader);
        const imageContainer = document.createElement('div');
        imageContainer.className = 'popup__image-container';
        popup.appendChild(imageContainer);
        ['https://pleygrawn.vercel.app/xanov_clear.png'].forEach(src => {
            const box = document.createElement('div');
            box.className = 'popup__image-box';
            const img = document.createElement('img');
            img.src = src;
            box.appendChild(img);
            imageContainer.appendChild(box);
        });
        const settingText = document.createElement('div');
        settingText.className = 'meet-gui__small';
        settingText.textContent = 'Add your options and toggles here.';
        settingText.style = 'text-align: center; color: var(--text);';
        popup.appendChild(settingText);
        // ... (End of Settings Popup setup) ...


        const dragBar = document.createElement('div');
        dragBar.className = 'meet-gui__bar';
        const barLeft = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'meet-gui__title';
        title.textContent = 'Thug Ware - Google Meet';
        const version = document.createElement('div');
        version.className = 'meet-gui__small';
        version.textContent = 'V0.7 - Modded';
        barLeft.appendChild(title); barLeft.appendChild(version);

        const barRight = document.createElement('div');
        barRight.style.cssText = 'display:flex;flex-direction:column;gap:6px;align-items:flex-end';
        const dragText = document.createElement('div');
        dragText.className = 'meet-gui__small inter-normal';
        dragText.textContent = 'Drag to move';
        dragText.style.cssText = 'color:#5a5a5a;font-size: 10px;';
        barRight.appendChild(dragText);

        dragBar.appendChild(barLeft); dragBar.appendChild(barRight);
        gui.appendChild(dragBar);

        const content = document.createElement('div');
        content.className = 'meet-gui__content';

        // --- 1. Combined Run All Button ---

        const runAllBtn = document.createElement('button');
        runAllBtn.className = 'run-all-btn inter-bold';
        runAllBtn.textContent = 'Auschwitz';
        runAllBtn.dataset.state = 'off';

        runAllBtn.onclick = () => {
            const isRunning = runAllBtn.dataset.state === 'on';

            // Toggle ALL modules state
            modules.forEach(mod => mod.state = !isRunning);

            // Update button and start/stop interval
            if (!isRunning) {
                runAllBtn.dataset.state = 'on';
                runAllBtn.textContent = 'Dropping Zyklon B';
                runAllBtn.classList.add('run-all-btn--active');
                intervals[ALL_MODULES_NAME] = setInterval(runAllModules, SPAM_INTERVAL_MS);
            } else {
                runAllBtn.dataset.state = 'off';
                runAllBtn.textContent = 'Auschwitz';
                runAllBtn.classList.remove('run-all-btn--active');
                clearInterval(intervals[ALL_MODULES_NAME]);
            }

            // Update individual module GUI elements
            updateModuleGUI();
        };
        content.appendChild(runAllBtn);

        // --- 2. Chat Spam Custom Input ---

        const chatInputContainer = document.createElement('div');
        chatInputContainer.className = 'chat-input-container';

        const chatInputLabel = document.createElement('div');
        chatInputLabel.className = 'module__title inter-bold';
        chatInputLabel.textContent = 'Custom Message';
        chatInputLabel.style.marginBottom = '4px';
        chatInputLabel.style.fontSize = '5px';

        const chatInput = document.createElement('input');
        chatInput.className = 'module-input inter-normal';
        chatInput.type = 'text';
        chatInput.placeholder = `Spam Text (Default: ${DEFAULT_SPAM_TEXT})`;
        chatInput.value = DEFAULT_SPAM_TEXT;

        chatInput.oninput = (e) => {
            spamChatInputRef = e.target.value.trim() !== "" ? e.target.value : DEFAULT_SPAM_TEXT;
        };

        chatInputContainer.appendChild(chatInputLabel);
        chatInputContainer.appendChild(chatInput);
        content.appendChild(chatInputContainer);

        // --- 3. Individual Module Toggles (for granular control) ---

        const moduleGrid = document.createElement('div');
        moduleGrid.className = 'module-grid';
        moduleGrid.id = 'module-grid';
        content.appendChild(moduleGrid);

        // Function to update the appearance of individual module controls
        const updateModuleGUI = () => {
             modules.forEach(mod => {
                 const modDiv = document.getElementById(`module-${mod.name.replace(/\s/g, '-')}`);
                 if (!modDiv) return;

                 const statusIndicator = modDiv.querySelector('.toggle-indicator');
                 const toggleBtn = modDiv.querySelector('.btn');

                 if (mod.state) {
                     toggleBtn.style.background = '#BE140D';
                     statusIndicator.textContent = 'ON';
                     statusIndicator.classList.add('toggle-indicator--active');
                     toggleBtn.classList.remove('inter-normal');
                     toggleBtn.classList.add('inter-bold');
                 } else {
                     toggleBtn.style.background = '#202020';
                     statusIndicator.textContent = 'OFF';
                     statusIndicator.classList.remove('toggle-indicator--active');
                     toggleBtn.classList.remove('inter-bold');
                     toggleBtn.classList.add('inter-normal');
                 }
             });
        };

        modules.forEach(mod => {
            const moduleDiv = document.createElement('div');
            moduleDiv.className = 'module';
            moduleDiv.id = `module-${mod.name.replace(/\s/g, '-')}`;

            const moduleTitle = document.createElement('div');
            moduleTitle.className = 'module__title inter-bold';
            moduleTitle.textContent = mod.name;
            moduleDiv.appendChild(moduleTitle);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'module__controls';

            const statusText = document.createElement('div');
            statusText.className = 'status-text';
            statusText.textContent='Status: ';
            const statusIndicator = document.createElement('span');
            statusIndicator.className='toggle-indicator';
            statusIndicator.textContent= mod.state ? 'ON' : 'OFF';
            if (mod.state) statusIndicator.classList.add('toggle-indicator--active');
            statusText.appendChild(statusIndicator);

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn btn--small inter-normal';
            toggleBtn.textContent = 'Toggle';
            toggleBtn.style.background = '#202020'; // Start off

            // Update individual toggle logic
            toggleBtn.onclick = () => {
                const wasRunning = runAllBtn.dataset.state === 'on';

                // If the "Run All" button is active, stopping or starting a single module
                // means we need to stop the global interval and manage intervals individually.
                if (wasRunning) {
                    clearInterval(intervals[ALL_MODULES_NAME]);
                    runAllBtn.dataset.state = 'off';
                    runAllBtn.textContent = 'Auschwitz';
                    runAllBtn.classList.remove('run-all-btn--active');

                    // Convert global interval to individual ones
                    modules.forEach(m => {
                        if (m.name !== mod.name && m.state) {
                             intervals[m.name] = setInterval(m.action, SPAM_INTERVAL_MS);
                        }
                    });
                }

                mod.state = !mod.state;

                if (mod.state) {
                    // Start individual interval if not running globally
                    if (!intervals[mod.name]) intervals[mod.name] = setInterval(mod.action, SPAM_INTERVAL_MS);
                } else {
                    // Stop individual interval
                    clearInterval(intervals[mod.name]);
                    delete intervals[mod.name];
                }

                updateModuleGUI();
            };

            controlsDiv.appendChild(statusText);
            controlsDiv.appendChild(toggleBtn);
            moduleDiv.appendChild(controlsDiv);
            moduleGrid.appendChild(moduleDiv);
        });

        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'btn';
        settingsBtn.textContent = '⚙';
        settingsBtn.onclick = () => {
             const rect = gui.getBoundingClientRect();
             popup.style.top = rect.top + 'px';
             popup.style.left = rect.left + 'px';
             popup.style.height = rect.height + 'px';
             gui.style.display = 'none';
             popup.style.display = 'flex';
        };
        const settingsDiv = document.createElement('div');
        settingsDiv.style.cssText = 'display: flex; justify-content: flex-end; align-items: center; gap: 8px;';
        settingsDiv.appendChild(settingsBtn);
        content.appendChild(settingsDiv);

        const footer = document.createElement('div');
        footer.className = 'meet-gui__footer';
        const footerText = document.createElement('div');
        footerText.className = 'meet-gui__small';
        footerText.textContent = 'Glory to CCP! // navox // This thugware only for Google Meet. Zoom no work';
        footerText.style.cssText = 'font-size: 8px;color: #5e5e5e;';
        footer.appendChild(footerText);
        content.appendChild(footer);
        gui.appendChild(content);
        document.body.appendChild(gui);

        // --- Dragging Logic ---
        let isDrag=false,offX=0,offY=0;
        dragBar.addEventListener("mousedown", e=>{isDrag=true; const rect=gui.getBoundingClientRect(); offX=e.clientX-rect.left; offY=e.clientY-rect.top; dragBar.style.cursor="grabbing";});
        document.addEventListener("mousemove", e=>{if(!isDrag) return; gui.style.left=e.clientX-offX+"px"; gui.style.top=e.clientY-offY+"px";});
        document.addEventListener("mouseup", ()=>{isDrag=false; dragBar.style.cursor="grab";});
    };

    buildGUI();
})();
