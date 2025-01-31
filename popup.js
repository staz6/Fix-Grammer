document.getElementById("checkButton").addEventListener("click", async () => {
    const inputText = document.getElementById("inputText").value;
    const spinner = document.getElementById("spinner");
    const button = document.getElementById("checkButton");
    const buttonText = document.getElementById("buttonText");
    const loadingText = document.getElementById("loadingText");
    const outputDiv = document.getElementById("output");
  
    if (inputText.trim()) {
      button.classList.add("loading");
      spinner.style.display = "inline-block"; 
      buttonText.style.display = "none";
      outputDiv.innerText = "";  
  
      try {
        const fixedText = await fixGrammarWithOpenAI(inputText);
        document.getElementById("output").innerText = `${fixedText}`;
      } catch (error) {
        document.getElementById("output").innerText = "An error occurred while fixing the grammar.";
      } finally {
        
        button.classList.remove("loading");
        spinner.style.display = "none";
        buttonText.style.display = "inline"; 
      }
    } else {
      document.getElementById("output").innerText = "Please enter some text to fix.";
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
      throw error; 
    }
  }
