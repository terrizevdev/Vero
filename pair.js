const { veroid } = require('./id'); 
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { Storage } = require("megajs");

const {
    default: Terri,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

// Array of Mega credentials
const megaCredentials = [
    { email: 'kibuukauthuman123@gmail.com', password: 'j42cvCmC2L_RF:2' },
    { email: '', password: '' }
];

// Group and Channel IDs
const GROUP_INVITE_CODE = "LVtMOpKXWogECSmtBylUix";
const CHANNEL_JID = "120363397100406773@newsletter";

// Audio URL
const SUCCESS_AUDIO_URL = "https://files.catbox.moe/7b04vi.mp3";

// Context info for forwarding
const CONTEXT_INFO = {
    forwardingScore: 5,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363397100406773@newsletter',
        newsletterName: "Vᴇʀᴏɴɪᴄᴀ Aɪ"
    }
};

// External Ad Reply
const EXTERNAL_AD_REPLY = {
    externalAdReply: {
        title: `VERONICA-AI SESSION_ID`,
        body: "",
        thumbnailUrl: `https://files.catbox.moe/6h4wz9.jpg`,
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: false,
        sourceUrl: "https://github.com/Terrizev/"
    }
};

// Function to generate a random Mega ID
function randomMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

// Function to upload credentials to Mega
async function uploadCredsToMega(credsPath) {
    try {
        const chosenCreds = megaCredentials[Math.floor(Math.random() * megaCredentials.length)];
        const storage = await new Storage({
            email: chosenCreds.email,
            password: chosenCreds.password
        }).ready;
        console.log('Mega storage initialized.');

        if (!fs.existsSync(credsPath)) {
            throw new Error(`File not found: ${credsPath}`);
        }

        const fileSize = fs.statSync(credsPath).size;
        const uploadResult = await storage.upload({
            name: `${randomMegaId()}.json`,
            size: fileSize
        }, fs.createReadStream(credsPath)).complete;

        console.log('Session successfully uploaded to Mega.');
        const fileNode = storage.files[uploadResult.nodeId];
        const megaUrl = await fileNode.link();
        console.log(`Session Url: ${megaUrl}`);
        return megaUrl;
    } catch (error) {
        console.error('Error uploading to Mega:', error);
        throw error;
    }
}

// Function to remove a file
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Router to handle pairing code generation
router.get('/', async (req, res) => {
    const id = veroid(); 
    let num = req.query.number;

    async function VERONICA() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            let vero = Terri({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari")
            });

            if (!vero.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await vero.requestPairingCode(num);
                console.log(`Your Code: ${code}`);

                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            vero.ev.on('creds.update', saveCreds);
            vero.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(5000);
                    const filePath = __dirname + `/temp/${id}/creds.json`;

                    if (!fs.existsSync(filePath)) {
                        console.error("File not found:", filePath);
                        return;
                    }

                    // Upload session to Mega
                    const megaUrl = await uploadCredsToMega(filePath);
                    const sid = megaUrl.includes("https://mega.nz/file/")
                        ? 'Veronica;;;' + megaUrl.split("https://mega.nz/file/")[1]
                        : 'Error: Invalid URL';

                    console.log(`Session ID: ${sid}`);

                    // Send session ID first
                    await vero.sendMessage(vero.user.id, { text: sid });

                    // Auto join group
                    try {
                        await vero.groupAcceptInvite(GROUP_INVITE_CODE);
                        console.log("Successfully joined VERONICA-AI group");
                    } catch (groupError) {
                        console.error("Group join error:", groupError.message);
                        await vero.sendMessage(vero.user.id, {
                            text: "Couldn't auto-join group. Please join manually: https://chat.whatsapp.com/LVtMOpKXWogECSmtBylUix?mode=ems_wa_t"
                        });
                    }

                    // Auto follow channel
                    try {
                        const metadata = await vero.newsletterMetadata(CHANNEL_JID);
                        if (metadata.viewer_metadata === null) {
                            await vero.newsletterFollow(CHANNEL_JID);
                            console.log("CHANNEL FOLLOW ✅");
                        }
                    } catch (channelError) {
                        console.error("Channel follow error:", channelError.message);
                    }

                    try {
                        // Send audio with contextInfo and externalAdReply
                        await vero.sendMessage(vero.user.id, {
                            audio: { url: SUCCESS_AUDIO_URL },
                            ptt: true,
                            mimetype: 'audio/mpeg',
                            contextInfo: CONTEXT_INFO,
                            ...EXTERNAL_AD_REPLY
                        });
                        console.log("Success audio sent with contextInfo and externalAdReply");
                    } catch (audioError) {
                        console.error("Failed to send audio, sending text message instead:", audioError.message);
                        
                        const successMessage = `
> 🔒 *Your Session ID* is ready!  
> ⚠️ _Keep it private and secure - don't share it with anyone._ 

> 💡 *What's Next?* 
> 1️⃣ Explore all the cool features
> 2️⃣ Check .menu for commands
> 3️⃣ Enjoy seamless automation! 🤖  

> ⭐ *GitHub:* 👇
> https://github.com/Terrizev/  

🚀 _Thanks for choosing VERONICA BOT!_ ✨`;

                        // Send image message with contextInfo and externalAdReply
                        await vero.sendMessage(vero.user.id, {
                            image: { url: "https://files.catbox.moe/6h4wz9.jpg" },
                            caption: successMessage.trim(),
                            contextInfo: CONTEXT_INFO,
                            ...EXTERNAL_AD_REPLY
                        });
                    }

                    await delay(100);
                    await vero.ws.close();
                    return removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    VERONICA();
                }
            });
        } catch (err) {
            console.error("Service Has Been Restarted:", err);
            removeFile('./temp/' + id);

            if (!res.headersSent) {
                res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    await VERONICA();
});

module.exports = router;
