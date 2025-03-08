import axios from 'axios';
import { load } from 'cheerio';
import db from './db';

interface Guns {
  "Assault Carbines": string[];
  "Assault Rifles": string[];
  "Bolt-Action": string[];
  "Marksman Rifles": string[];
  Shotguns: string[];
  SMGs: string[];
  LMGs: string[];
  Launchers: string[];
  Pistols: string[];
  Revolvers: string[];
}

async function scrapeGuns() {
  try {
    const { data } = await axios.get('https://escapefromtarkov.fandom.com/wiki/Weapons');
    console.log("Fetched HTML for Guns");

    const $ = load(data);
    const guns: Guns = {
      "Assault Carbines": [],
      "Assault Rifles": [],
      "Bolt-Action": [],
      "Marksman Rifles": [],
      Shotguns: [],
      SMGs: [],
      LMGs: [],
      Launchers: [],
      Pistols: [],
      Revolvers: [],
    };

    const extractGunsFromCategory = (categoryId: string, targetArray: string[]): void => {
      const categorySection = $(`#${categoryId}`).parent();
      const categoryTable = categorySection.nextAll('table.wikitable').first();

      categoryTable.find('tbody tr').each((_, row) => {
        const gunName = $(row).find('td a.mw-redirect').text().trim();
        if (gunName) {
          console.log(`Found gun in ${categoryId}:`, gunName);
          targetArray.push(gunName);
        }
      });
    };

    // Map category IDs to gun categories
    const gunCategoryMapping: Record<string, keyof Guns> = {
      "Assault_carbines": "Assault Carbines",
      "Assault_rifles": "Assault Rifles",
      "Bolt-action_rifles": "Bolt-Action",
      "Designated_marksman_rifles": "Marksman Rifles",
      "Grenade_launchers": "Launchers",
      "Light_machine_guns": "LMGs",
      "Shotguns": "Shotguns",
      "Submachine_guns": "SMGs",
      "Pistols": "Pistols",
      "Revolvers": "Revolvers",
    };

    Object.entries(gunCategoryMapping).forEach(([categoryId, gunType]) => {
      extractGunsFromCategory(categoryId, guns[gunType]);
    });

    // Store in MySQL
    const connection = await db.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS guns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
        category VARCHAR(255)
      )`
    );

    for (const [category, gunList] of Object.entries(guns)) {
      for (const gun of gunList) {
        //make sure the GL sidearm isn't put in the table
        if(gun !== "M32A1"){
          await connection.query(
            `INSERT INTO guns (name, category) VALUES (?, ?) ON DUPLICATE KEY UPDATE category=VALUES(category)`,
            [gun, category]
          );
        }
      }
    }

    connection.release();
    console.log("Gun data saved to database.");
  } catch (error) {
    console.error("Error scraping guns:", error);
  }
}

export default scrapeGuns;
