const el = (sel) => document.querySelector(sel);
const messagesEl = el('#messages');
const chipsEl = el('#chips');
const profileEl = el('#profile');
const composer = el('#composer');
const composerForm = el('#composerForm');
const leadModal = el('#leadModal');

let BOOT = { profile: null, prompts: [], theme: null };

function renderProfile(profile) {
  profileEl.innerHTML = `
    <img src="${BOOT?.theme?.logo || '/logo.svg'}" alt="avatar" />
    <div class="meta">
      <strong>${profile.name}</strong>
      <span>${profile.title}</span>
    </div>
  `;
}

function renderChips(prompts) {
  chipsEl.innerHTML = '';
  prompts.forEach((p) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.textContent = p;
    b.addEventListener('click', () => {
      composer.value = p;
      composer.focus();
    });
    chipsEl.appendChild(b);
  });
}

function appendMessage(role, text) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;

  const MAX = 600;
  if (text.length > MAX) {
    const short = text.slice(0, MAX) + '...';
    bubble.innerHTML = `<div>${short}</div><span class="more">Devamını göster</span>`;
    bubble.querySelector('.more').addEventListener('click', () => {
      bubble.innerHTML = `<div>${text}</div>`;
    });
  } else {
    bubble.textContent = text;
  }
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function bootstrap() {
  const res = await fetch('/api/bootstrap');
  const data = await res.json();
  BOOT = data;
  renderProfile(data.profile);
  renderChips(data.prompts || []);
}

composerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = composer.value.trim();
  if (!text) return;
  appendMessage('user', text);
  composer.value = '';

  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  appendMessage('assistant', data.text || '');

  if (data.leadRequested) {
    leadModal.showModal();
  }
});

bootstrap().catch(console.error);
