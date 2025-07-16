async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const userText = input.value;
  
  if (!userText.trim()) return;

  chatBox.innerHTML += `<div><strong>You:</strong> ${userText}</div>`;
  input.value = "";

  const res = await fetch("https://your-backend-url.com/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: userText })
  });

  const data = await res.json();
  chatBox.innerHTML += `<div><strong>Bot:</strong> ${data.answer}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}
