const express = require('express');
const app = express();

// 1. Zafiyetli Endpoint (XSS'e Açık)
// req.query.name doğrudan HTML içine basılıyor (Saldırgan <script> enjekte edebilir)
app.get('/unsafe', (req, res) => {
    const name = req.query.name || 'Misafir';
    res.send(`
        <h1>Hoş geldin, ${name}!</h1>
        <p>Arama kutusundan /unsafe?name=&lt;script&gt;alert(1)&lt;/script&gt; deneyin.</p>
    `);
});

// 2. Güvenli Endpoint (CSP Korumalı)
// Kötü niyetli XSS payload'ı girilse bile tarayıcı CSP sayesinde çalıştırmayacaktır.
app.get('/safe', (req, res) => {
    // Content-Security-Policy başlığı ekliyoruz:
    // Sadece aynı kökenden (self) gelen betiklere (script) izin ver. Inline script'leri engelle!
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'");
    
    const name = req.query.name || 'Misafir';
    res.send(`
        <h1>Hoş geldin, ${name}!</h1>
        <p>Arama kutusundan /safe?name=&lt;script&gt;alert(1)&lt;/script&gt; deneyin.</p>
        <p style="color: green;">DevTools (F12) Console'u açarak CSP Violation hatasını görebilirsiniz.</p>
    `);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`XSS & CSP Lab uygulaması çalışıyor!`);
    console.log(`Zafiyetli: http://localhost:${PORT}/unsafe?name=<script>alert('XSS')</script>`);
    console.log(`Korumalı:  http://localhost:${PORT}/safe?name=<script>alert('XSS')</script>`);
});
