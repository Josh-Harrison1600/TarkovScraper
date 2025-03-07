import axios from 'axios';
import { load } from 'cheerio';
import db from './db';

async function scrapeBackpacks() {
  try {
    const { data } = await axios.get("https://escapefromtarkov.fandom.com/wiki/Backpacks");
    console.log("Fetched HTML for Backpacks");

    const $ = load(data);
    const backpacks: string[] = [];

    $('table.wikitable tbody tr').each((_, row) => {
      const backpackName = $(row).find('th a').text().trim();
      if (backpackName) {
        console.log("Found backpack:", backpackName);
        backpacks.push(backpackName);
      }
    });

    const connection = await db.getConnection();
    await connection.query(`CREATE TABLE IF NOT EXISTS backpacks (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE)`);

    for (const item of backpacks) {
      await connection.query(`INSERT INTO backpacks (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name`, [item]);
    }

    connection.release();
    console.log("Backpack data saved to database.");
  } catch (error) {
    console.error("Error scraping backpacks:", error);
  }
}

export default scrapeBackpacks;
