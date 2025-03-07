import axios from 'axios';
import { load } from 'cheerio';
import db from './db';

async function scrapeRigs() {
  try {
    const { data } = await axios.get("https://escapefromtarkov.fandom.com/wiki/Chest_rigs");
    console.log("Fetched HTML for Rigs");

    const $ = load(data);
    const rigs: string[] = [];

    $('table.wikitable tbody tr').each((_, row) => {
      const rigName = $(row).find('th a').text().trim();
      if (rigName) {
        console.log("Found rig:", rigName);
        rigs.push(rigName);
      }
    });

    const connection = await db.getConnection();
    await connection.query(`CREATE TABLE IF NOT EXISTS rigs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE)`);
    
    for (const item of rigs) {
      await connection.query(`INSERT INTO rigs (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name`, [item]);
    }

    connection.release();
    console.log("Rigs data saved to database.");
  } catch (error) {
    console.error("Error scraping rigs:", error);
  }
}

export default scrapeRigs;
