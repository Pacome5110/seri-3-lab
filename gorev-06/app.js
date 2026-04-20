require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const cookieSession = require('cookie-session');

const app = express();

app.use(cookieSession({
    name: 'session',
    keys: ['super-secret-key'], // Sadece test amaçlı hardcoded, gerçekte çevresel değişkende olmalı
    maxAge: 24 * 60 * 60 * 1000 // 24 saat
}));

// PKCE Helper Fonksiyonları
function base64URLEncode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function getCodeVerifier() {
    return base64URLEncode(crypto.randomBytes(32));
}

function getCodeChallenge(verifier) {
    return base64URLEncode(crypto.createHash('sha256').update(verifier).digest());
}

// 1. /login -> Google'a yönlendirme (Authorization Request)
app.get('/login', (req, res) => {
    // Verifier üretip, callback dönüşünde token takası için session'da saklıyoruz
    const verifier = getCodeVerifier();
    req.session.code_verifier = verifier;

    const challenge = getCodeChallenge(verifier);

    // Google OAuth 2.0 Endpoint
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', 'http://localhost:3000/callback');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('code_challenge', challenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    res.redirect(authUrl.toString());
});

// 2. /callback -> Token Exchange
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const verifier = req.session.code_verifier;

    if (!code || !verifier) {
        return res.status(400).send("Zorunlu parametre eksik.");
    }

    try {
        // Token İsteği (Token Request)
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET, // Bazı public PKCE istemcilerinde gönderilmez ancak confidential ise gönderilir
            code: code,
            code_verifier: verifier,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:3000/callback'
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const tokens = tokenResponse.data;

        // Kullanıcı bilgisini id_token üzerinden veya userinfo endpoint'inden çekebiliriz
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        // Başarılı giriş
        const user = userInfoResponse.data;
        res.send(`
            <h1>Giriş Başarılı!</h1>
            <p><strong>Hoş geldin, ${user.name}</strong> (${user.email})</p>
            <img src="${user.picture}" alt="Profile Picture" width="100" />
            <br><a href="/logout">Çıkış Yap</a>
        `);

    } catch (error) {
        console.error("Token exchange err:", error.response?.data || error.message);
        res.status(500).send("Giriş işlemi sırasında hata oluştu:<br>" + JSON.stringify(error.response?.data));
    }
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.send('Çıkış yapıldı. <a href="/login">Tekrar Giriş Yap</a>');
});

// Ana Dizin
app.get('/', (req, res) => {
    res.send('<h1>OAuth PKCE Demo</h1><a href="/login">Google ile Giriş Yap</a>');
});

app.listen(3000, () => {
    console.log('OAuth lab çalışıyor: http://localhost:3000');
});
