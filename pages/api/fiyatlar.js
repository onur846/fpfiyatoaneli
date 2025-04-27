import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const baseUrl = 'https://fpprotr.com/cihazimi-tamir-et/iphone-serileri/';
    const { data } = await axios.get(baseUrl);
    const $ = cheerio.load(data);

    const fiyatlar = {};

    // Ana sayfadaki iPhone serilerinin linklerini bulalım
    const seriLinkleri = [];
    $('a.elementor-button-link').each((i, el) => {
      const link = $(el).attr('href');
      if (link && link.includes('/iphone-')) {
        seriLinkleri.push(link);
      }
    });

    // Her seri linkine gidip modelleri ve fiyatları çekelim
    for (const link of seriLinkleri) {
      const { data: pageData } = await axios.get(link);
      const $$ = cheerio.load(pageData);

      $$('.elementor-widget-container').each((i, el) => {
        const modelIsmi = $$(el).find('h2, h3').text().trim();
        const fiyatText = $$(el).text();

        if (modelIsmi && fiyatText.includes('₺')) {
          const fiyatMatch = fiyatText.match(/([\d.,]+)\s*₺/);
          if (fiyatMatch && fiyatMatch[1]) {
            const fiyat = parseFloat(fiyatMatch[1].replace('.', '').replace(',', '.'));
            if (!isNaN(fiyat)) {
              fiyatlar[modelIsmi] = {
                "FPPro Çekilen Fiyat": fiyat
              };
            }
          }
        }
      });
    }

    // Şimdi database.json içeriğini de okuyalım
    const filePath = path.join(process.cwd(), 'public', 'database.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(jsonData);

    // TR Cihazı Fiyatları ekle
    for (const model in parsedData.trCihazFiyatlari) {
      if (!fiyatlar[model]) fiyatlar[model] = {};
      fiyatlar[model]["TR Cihazı Full Fiyatı"] = parsedData.trCihazFiyatlari[model];
    }

    // Anakart Fiyatları ekle
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
