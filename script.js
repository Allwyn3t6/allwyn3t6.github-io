async function sendMessage() {
  const userInput = document.getElementById("user-input").value;
  const chatBox = document.getElementById("chat-box");

  chatBox.innerHTML += `<div class="user">You: ${userInput}</div>`;

  const response = await fetch("https://backend-rp2040.onrender.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: userInput })
  });

  const data = await response.json();
  chatBox.innerHTML += `<div class="bot">Bot: ${data.response}</div>`;

  document.getElementById("user-input").value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}
