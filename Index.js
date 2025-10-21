const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const pino = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('sessions')

  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || !msg.key.remoteJid.endsWith('@g.us')) return

    const text =
      msg.message.conversation?.toLowerCase() ||
      msg.message.extendedTextMessage?.text?.toLowerCase() ||
      ''

    const badWords = ['gali1', 'gali2']
    const groupId = msg.key.remoteJid
    const participant = msg.key.participant || msg.key.remoteJid

    if (badWords.some(w => text.includes(w))) {
      await sock.sendMessage(groupId, { delete: msg.key })
      await sock.sendMessage(groupId, {
        text: `⚠️ @${participant.split('@')[0]} language theek rakho!`,
        mentions: [participant]
      })
    }
  })
}

startBot()
