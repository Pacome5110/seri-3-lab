// ÖNCESİ: Vulnerable Code (Zafiyetli Kod)
// Kullanıcı girdisi doğrudan SQL sorgusuna string olarak ekleniyor.
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM Users WHERE email = '${email}' AND password = '${password}'`;
  
  // Eğer email "' OR 1=1 --" olursa, oluşan sorgu:
  // SELECT * FROM Users WHERE email = '' OR 1=1 --' AND password = '...'
  
  const user = await db.query(sql); // TEHLİKELİ
});

// SONRASI: Parameterized Queries (Savunma / Düzeltilmiş Kod)
// Prepared Statement kullanarak SQL motorunun değişkenleri ayırması sağlanır.
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Sequelize / Prisma (Modern ORM) 
  const user = await db.Users.findOne({
    where: {
      email: email,
      password: password // Hashlenmiş olmalı, ancak örnek için düz yazıldı
    }
  });

  // veya Raw Query ile Parameterized Query örneği (node-postgres / pg):
  const sql = `SELECT * FROM Users WHERE email = $1 AND password = $2`;
  const result = await pool.query(sql, [email, password]); // GÜVENLİ
});
