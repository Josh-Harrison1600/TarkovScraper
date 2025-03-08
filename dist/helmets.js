"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const db_1 = __importDefault(require("./db"));
function scrapeHelmets() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield axios_1.default.get("https://escapefromtarkov.fandom.com/wiki/Headwear");
            console.log("Fetched HTML for Helmets");
            const $ = (0, cheerio_1.load)(data);
            const helmets = {
                armored: [],
                vanity: [],
            };
            const extractHelmetsFromCategory = (categoryId, targetArray) => {
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
            const connection = yield db_1.default.getConnection();
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS helmets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
        category VARCHAR(255)
      )`);
            for (const [category, helmetList] of Object.entries(helmets)) {
                for (const helmet of helmetList) {
                    yield connection.query(`INSERT INTO helmets (name, category) VALUES (?, ?) ON DUPLICATE KEY UPDATE category=VALUES(category)`, [helmet, category]);
                }
            }
            connection.release();
            console.log("Helmet data saved to database.");
        }
        catch (error) {
            console.error("Error scraping helmets:", error);
        }
    });
}
exports.default = scrapeHelmets;
