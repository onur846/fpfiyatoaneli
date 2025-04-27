import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Proxy URL'den FPPro fiyatları çekiyoruz
    const { data: proxyFiyatlar } = await axios.get('https://renderproxy-9024.onrender.com/');

    // database.json'dan TR cihazı ve anakart fiyatlarını da çekiyoruz
    const filePath = path.join(process.cwd(), 'public', 'database.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(jsonData);

    const fiyatlar = {};

    // Proxy üzerinden gelen FPPro fiyatlarını ekle
    for (const model in proxyFiyatlar) {
      fiyatlar[model] = {
        "FPPro Çekilen Fiyat": proxyFiyatlar[model]
      };
    }

    // TR Cihazı fiyatları ekle
    for (const model in parsedData.trCihazFiyatlari) {
      if (!fiyatlar[model]) fiyatlar[model] = {};
      fiyatlar[model]["TR Cihazı Full Fiyatı"] = parsedData.trCihazFiyatlari[model];
    }

    // Anakart fiyatları ekle
    for (const model in parsedData.anakartFiyatlari) {
      if (!fiyatlar[model]) fiyatlar[model] = {};
      fiyatlar[model]["Anakart Onarım"] = parsedData.anakartFiyatlari[model];
    }

    res.status(200).json(fiyatlar);

  } catch (error) {
    console.error('Veri çekilirken hata:', error.message);
    res.status(500).json({ error: 'Fiyatlar çekilemedi.' });
  }
}
