const forge = require('node-forge')
const fs = require('fs')

// Gera o par de chaves RSA (2048 bits)
const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 })

// Converte para PEM (formato legível para salvar)
const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey)
const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey)

// Salva os arquivos
fs.writeFileSync('privateKey.pem', privateKeyPem)
fs.writeFileSync('publicKey.pem', publicKeyPem)

console.log('✅ Par de chaves RSA gerado com sucesso!')
