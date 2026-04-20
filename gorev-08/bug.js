const express = require('express');
const app = express();

app.get('/evaluate', (req, res) => {
    // BILINCLI ZAFIYET: Semgrep'in yakalamasi icin.
    // Kullanicidan gelen input eval icinde calistiriliyor (RCE / Code Injection)
    const result = eval(req.query.code); 
    
    // GUVENLI YONETIM (Duzeltilmis hali):
    // const result = customSafeCalculationFunction(req.query.code);

    res.send('Sonuc: ' + result);
});

app.listen(3000, () => console.log('App running'));
