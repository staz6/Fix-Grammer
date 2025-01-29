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
      func: (text) => alert(`Fixed Text: ${text}`),
      args: [fixedText]
    });
  }
});

async function fixGrammarWithOpenAI(text) {
  const data = `fix grammar: ${text}`;
  const apiKey = 'AIzaSyCKQghhg7mpVs9xPc-NNMDBTJiFLsYnRGE';  // Replace with your actual API key
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
    console.log(result); // Logs the full response to the console

    // Extract the fixed text from the response (inside candidates -> content -> parts -> text)
    const fixedText = result.candidates[0].content.parts[0].text;

    return fixedText;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "An error occurred while fixing the grammar.";
  }
}
