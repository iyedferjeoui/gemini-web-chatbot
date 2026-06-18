const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatWindow = document.getElementById("chat-window");
const sendBtn = document.getElementById("send-btn");
const themeToggle = document.getElementById("theme-toggle");

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function addMessage(text, sender) {
  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper " + sender;

  const msg = document.createElement("div");
  msg.className = "message " + sender;
  msg.textContent = text;

  const time = document.createElement("span");
  time.className = "timestamp";
  time.textContent = formatTime();

  wrapper.appendChild(msg);
  wrapper.appendChild(time);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  const wrapper = document.createElement("div");
  wrapper.className = "message-wrapper bot";
  wrapper.id = "typing-indicator";

  const msg = document.createElement("div");
  msg.className = "message bot typing";
  msg.innerHTML = "<span></span><span></span><span></span>";

  wrapper.appendChild(msg);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";
  sendBtn.disabled = true;
  showTypingIndicator();

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    removeTypingIndicator();

    if (data.error) {
      addMessage("⚠️ " + data.error, "error");
    } else {
      addMessage(data.reply, "bot");
    }
  } catch (err) {
    removeTypingIndicator();
    addMessage("⚠️ Can't reach the server. Check your connection and try again.", "error");
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem("chat-theme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem("chat-theme", newTheme);
});
