const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/wms', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Kullanıcı şeması
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

// POST /login API: Kullanıcı doğrulama
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Kullanıcıyı bulma
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).send('Kullanıcı bulunamadı');
  }

  // Şifreyi kontrol etme
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send('Yanlış şifre');
  }

  // JWT token oluşturma
  const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});

// Sunucu başlatma
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
