import axios from 'axios';
import { load } from 'cheerio';
import db from './db';

interface Helmets {
  armored: string[];
  vanity: string[];
}

async function scrapeHelmets() {
  try {
    const { data } = await axios.get("https://escapefromtarkov.fandom.com/wiki/Headwear");
    console.log("Fetched HTML for Helmets");

    const $ = load(data);
    const helmets: Helmets = {
      armored: [],
      vanity: [],
    };

    const extractHelmetsFromCategory = (categoryId: string, targetArray: string[]): void => {
      const categorySection = $(`#${categoryId}`).parent();
      const categoryTable = categorySection.nextAll('table.wikitable').first();

      categoryTable.find('tbody tr').each((_, row) => {
        const helmetName = $(row).find('th a').text().trim();
        if (helmetName) {
          console.log(`Found helmet in ${categoryId}:`, helmetName);
          targetArray.push(helmetName);
        }
      });
    };

    // Extract helmets from the respective categories
    extractHelmetsFromCategory('Armored', helmets.armored);
    extractHelmetsFromCategory('Vanity', helmets.vanity);

    // Store in MySQL
    const connection = await db.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS helmets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
        category VARCHAR(255)
      )`
    );

    for (const [category, helmetList] of Object.entries(helmets)) {
      for (const helmet of helmetList) {
        await connection.query(
          `INSERT INTO helmets (name, category) VALUES (?, ?) ON DUPLICATE KEY UPDATE category=VALUES(category)`,
          [helmet, category]
        );
      }
    }

    connection.release();
    console.log("Helmet data saved to database.");
  } catch (error) {
    console.error("Error scraping helmets:", error);
  }
}

export default scrapeHelmets;
