chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "fixGrammar",
    title: "Fix Grammar",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "fixGrammar" && info.selectionText) {
    const fixedText = await fixGrammarWithOpenAI(info.selectionText);

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (text) => {
        document.getElementById("aiGrammarPopup")?.remove();

        const popup = document.createElement("div");
        popup.id = "aiGrammarPopup";
        popup.innerText = text;
        document.body.appendChild(popup);

        const closeButton = document.createElement("button");
        closeButton.innerHTML = "&times;";
        closeButton.style.position = "absolute";
        closeButton.style.top = "6px";
        closeButton.style.right = "6px";
        closeButton.style.border = "none";
        closeButton.style.background = "none";
        closeButton.style.color = "#888";
        closeButton.style.fontSize = "18px";
        closeButton.style.cursor = "pointer";
        closeButton.addEventListener("click", () => {
          popup.remove();
        });

        popup.appendChild(closeButton);

        Object.assign(popup.style, {
          position: "absolute",
          backgroundColor: "#fff",
          color: "#333",
          padding: "12px 16px",
          borderRadius: "8px",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.15)",
          zIndex: "10000",
          maxWidth: "300px",
          wordWrap: "break-word",
          border: "1px solid #e0e0e0",
          fontFamily: "'Roboto', sans-serif",
          fontSize: "14px",
          lineHeight: "1.5",
          maxHeight: "300px",
          overflowY: "auto",
        });

        let closeTimeout;

        popup.addEventListener("mouseenter", () => {
          clearTimeout(closeTimeout);
        });

        popup.addEventListener("mouseleave", () => {
          closeTimeout = setTimeout(() => popup.remove(), 5000);
        });

        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        document.body.appendChild(popup);
        const popupHeight = popup.offsetHeight;
        const popupWidth = popup.offsetWidth;
        document.body.removeChild(popup);

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow > popupHeight + 12) {
          popup.style.top = `${rect.bottom + window.scrollY + 12}px`;
        } else if (spaceAbove > popupHeight + 12) {
          popup.style.top = `${rect.top + window.scrollY - popupHeight - 12}px`;
        } else {
          popup.style.top = `${(viewportHeight - popupHeight) / 2 + window.scrollY}px`;
        }

        popup.style.left = `${(viewportWidth - popupWidth) / 2 + window.scrollX}px`;

        document.body.appendChild(popup);

        closeTimeout = setTimeout(() => popup.remove(), 5000);
      },
      args: [fixedText],
    });
  }
});




async function fixGrammarWithOpenAI(text) {
  const data = `fix grammar: ${text}`;
  const apiKey = 'AIzaSyCKQghhg7mpVs9xPc-NNMDBTJiFLsYnRGE'; 

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: data }] }]
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    const fixedText = result.candidates[0].content.parts[0].text;

    return fixedText;
  } catch (error) {
    return "An error occurred while fixing the grammar.";
  }
}
