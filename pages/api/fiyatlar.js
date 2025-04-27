import cheerio from 'cheerio';
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const url = 'https://fpprotr.com/cihazimi-tamir-et/iphone-serileri/';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const fiyatlar = {};

    $('a.elementor-button-link').each((i, el) => {
      const model = $(el).text().trim();
      const link = $(el).attr('href');

      if (link && link.includes('/iphone-')) {
        fiyatlar[model] = {};
      }
    });

    res.status(200).json(fiyatlar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fiyatlar çekilemedi' });
  }
}
