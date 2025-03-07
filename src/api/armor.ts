import axios from 'axios';
import { load } from 'cheerio';
import db from './db';

async function scrapeArmor() {
  try {
    const { data } = await axios.get("https://escapefromtarkov.fandom.com/wiki/Armor_vests");
    console.log("Fetched HTML for Armor Vests");

    const $ = load(data);
    const armor: string[] = [];

    $('table.wikitable tbody tr').each((_, row) => {
      const armorName = $(row).find('th a').text().trim();
      if (armorName) {
        console.log("Found armor:", armorName);
        armor.push(armorName);
      }
    });

    const connection = await db.getConnection();
    await connection.query(`CREATE TABLE IF NOT EXISTS armor (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE)`);
    
    for (const item of armor) {
      await connection.query(`INSERT INTO armor (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name`, [item]);
    }

    connection.release();
    console.log("Armor data saved to database.");
  } catch (error) {
    console.error("Error scraping armor vests:", error);
  }
}

export default scrapeArmor;
