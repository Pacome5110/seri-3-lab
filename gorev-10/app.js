const express = require('express');
const helmet = require('helmet');

const app = express();

// Temel Helmet modülleri sayesinde birçok header otomatik set edilir
// A+ skoru için ekstra Strict-Transport-Security (HSTS) süresi de uzun tutuldu.
app.use(helmet({
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    // Gerekirse CSP kuralları eklenebilir veya sadece Helmet default'u bırakılabilir
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'"]
        }
    }
}));

app.get('/', (req, res) => {
    res.send('<h1>Security Headers A+ Demo</h1><p>Sayfayı securityheaders.com üzerinden taratın.</p>');
});

// Portu dinle (Deployment sırasında process.env.PORT kullanılmalı)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('Sunucu basladi...');
});
