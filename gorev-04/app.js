const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');

const app = express();

// Ayarlar
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CSRF Middleware kurulumu (Cookie tabanlı)
// DİKKAT: Görevin 3. adımı için önce bu middleware YORUM SATIRI yapılmalıydı (test edildi).
// Görevin 4. adımı için middleware AKTİF edildi:
const csrfProtection = csrf({ cookie: true });

// Basit oturum simülasyonu
app.use((req, res, next) => {
    // Gerçekte burada kontrol yapılır, simülasyon için oturum açık farz ediyoruz.
    req.user = { id: 1, name: 'Alice', balance: 500 };
    next();
});

// GET /transfer - Para transferi formunu gösterir
// csrfProtection middleware'i eklendiğinde req.csrfToken() kullanılabilir olur.
app.get('/transfer', csrfProtection, (req, res) => {
    res.render('transfer', { 
        user: req.user,
        csrfToken: req.csrfToken() // Token view'e gönderiliyor
    });
});

// POST /transfer - Transfer işlemini simüle eder
app.post('/transfer', csrfProtection, (req, res) => {
    const amount = req.body.amount;
    const to = req.body.to;
    
    // İşlem başarılı (Çünkü token doğrulandı)
    res.send(`<h1>Başarılı!</h1><p>${to} kişisine ${amount} TL gönderildi.</p><a href="/transfer">Geri dön</a>`);
});

// Hata ayıklama (CSRF invalid token hatasını yakalamak için)
app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403).send('<h2>403 Forbidden</h2><p>Form tabanlı sahtecilik (CSRF) tespit edildi! İşlem reddedildi.</p>');
});

app.listen(3000, () => {
    console.log('CSRF Lab uygulaması http://localhost:3000 portunda çalışıyor');
});
