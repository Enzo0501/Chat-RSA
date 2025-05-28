const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

const name = prompt('Qual o seu nome?')

messageForm.addEventListener('submit', async e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(name, message, true)

  await fetch('/enviar-mensagem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message })
  })

  messageInput.value = ''
})

function appendMessage(sender, message, isSelf) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.classList.add(isSelf ? 'self' : 'other')
  div.innerText = message
  messageContainer.appendChild(div)
  messageContainer.scrollTop = messageContainer.scrollHeight
}

async function atualizarMensagens() {
  const res = await fetch('/mensagens')
  const mensagens = await res.json()
  messageContainer.innerHTML = ''
  mensagens.forEach(m => {
    appendMessage(m.name, m.message, m.name === name)
  })
}

setInterval(atualizarMensagens, 1000)
