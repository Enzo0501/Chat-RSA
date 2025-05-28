const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const path = require('path')
const forge = require('node-forge')
const fs = require('fs')

const app = express()
const PORT = 4000

let mensagens = []

// Carrega as chaves
const privateKeyPem = fs.readFileSync('privateKey.pem', 'utf8')
const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)

const publicKeyA = forge.pki.publicKeyFromPem(
  fs.readFileSync('publicKey_a.pem', 'utf8')
)

const WEBHOOK_URL = 'http://localhost:3000/webhook'

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname)))

// Envia mensagem criptografada para App A
app.post('/enviar-mensagem', async (req, res) => {
  const { name, message } = req.body

  const encrypted = publicKeyA.encrypt(message, 'RSA-OAEP')
  const encryptedBase64 = forge.util.encode64(encrypted)

  mensagens.push({ name, message: `🔒 ${encryptedBase64}` })

  try {
    await axios.post(WEBHOOK_URL, { name, encrypted: encryptedBase64 })
    res.status(200).send('Mensagem criptografada enviada com sucesso!')
  } catch (err) {
    console.error('[App B] Erro ao enviar mensagem:', err.message)
    res.status(500).send('Erro ao enviar mensagem')
  }
})

// Recebe mensagem criptografada de App A
app.post('/webhook', (req, res) => {
  const { name, encrypted } = req.body
  try {
    const encryptedBytes = forge.util.decode64(encrypted)
    const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP')

    console.log(`[App B] Recebido de ${name}: ${decrypted}`)
    mensagens.push({ name, message: decrypted })
    res.status(200).send('Mensagem recebida e descriptografada!')
  } catch (err) {
    console.error('[App B] Erro ao descriptografar:', err.message)
    res.status(400).send('Erro ao descriptografar')
  }
})

app.get('/mensagens', (req, res) => {
  res.json(mensagens)
})

app.listen(PORT, () => {
  console.log(`✅ App B rodando em http://localhost:${PORT}`)
})
