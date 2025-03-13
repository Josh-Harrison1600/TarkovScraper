import axios from 'axios';
import { load } from 'cheerio';
import db from './db';

async function scrapeRigs() {
  try {
    const { data } = await axios.get("https://escapefromtarkov.fandom.com/wiki/Chest_rigs");
    console.log("Fetched HTML for Rigs");

    const $ = load(data);
    const rigs: { name: string; category: string }[] = [];

    //function to extract rigs from a specific category
    const extractRigsFromCategory = (categoryId: string, categoryName: string): void => {
      const categorySection = $(`#${categoryId}`).parent(); 
      const categoryTable = categorySection.nextAll('table.wikitable').first(); 

      categoryTable.find('tbody tr').each((_, row) => {
        const rigName = $(row).find('th a').text().trim();
        if (rigName) {
          console.log(`Found ${categoryName}:`, rigName);
          rigs.push({ name: rigName, category: categoryName });
        }
      });
    };

    extractRigsFromCategory('Armored', 'Armored Rigs');
    extractRigsFromCategory('Unarmored', 'Unarmored Rigs');
    

    const connection = await db.getConnection();
    await connection.query(`CREATE TABLE IF NOT EXISTS rigs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE, category VARCHAR(50) NOT NULL)`);
    
    for (const item of rigs) {
      await connection.query(`INSERT INTO rigs (name, category) VALUES (?, ?) ON DUPLICATE KEY UPDATE category=VALUES(category)`, [item.name, item.category]);
    }

    connection.release();
    console.log("Rigs data saved to database.");
  } catch (error) {
    console.error("Error scraping rigs:", error);
  }
}

export default scrapeRigs;
