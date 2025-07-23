// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors());


mongoose.connect('mongodb://localhost:27017/simple_wms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => console.log('MongoDB bağlantı hatası:', err));


function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token gerekli' });

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token geçersiz' });
    req.user = decoded;
    next();
  });
}


const productSchema = new mongoose.Schema({
  customer: String,
  itemType: String,
  itemCode: String,
  itemName: String,
  itemId: String,
  description: String,
  expirationDate: Date,
  unitValue: String,
  upcCode: String,
  printJob: Number,
  printJobDate: Date,
  reorderQuantity: Number,
  poItem: Boolean,
  leadTime: String,
  perContainer: Number,
  lot: String,
  imageUpload: String
});
const Product = mongoose.model('Product', productSchema);

// Ürün API'leri (JWT ile korunuyor)
app.post('/api/products', verifyToken, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün eklenirken hata oluştu.' });
  }
});

app.get('/api/products', verifyToken, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürünler getirilirken hata oluştu.' });
  }
});

app.put('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        itemName: req.body.itemName,
        perContainer: req.body.perContainer
      },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün güncellenirken hata oluştu.' });
  }
});

app.delete('/api/products/:id', verifyToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ürün silinirken hata oluştu.' });
  }
});

// Kullanıcı Şeması ve Modeli
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Kullanıcı Kayıt
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış!' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.json({ message: 'Kayıt başarılı!' });
});

// Kullanıcı Giriş


app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Hatali kullanici adi veya şifre' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Hatali kullanici adi veya şifre' });
    }

    console.log("✅ Kullanıcı Adı:", username);
    console.log("✅ Girilen Şifre:", password);
    console.log("✅ Veritabanındaki Şifre:", user.password);
    console.log("✅ Karşılaştırma Sonucu:", isMatch);

    // Token oluştur
    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });

    console.log("🔑 Oluşturulan Token:", token); // Check in the terminal that the token was generated correctly

    res.json({ token });
  } catch (error) {
    console.error("⚠️ Login sırasında hata:", error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});


// Sunucu Başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});