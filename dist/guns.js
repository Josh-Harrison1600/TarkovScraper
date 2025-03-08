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
function scrapeGuns() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield axios_1.default.get('https://escapefromtarkov.fandom.com/wiki/Weapons');
            console.log("Fetched HTML for Guns");
            const $ = (0, cheerio_1.load)(data);
            const guns = {
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
            const extractGunsFromCategory = (categoryId, targetArray) => {
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
            const gunCategoryMapping = {
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
            const connection = yield db_1.default.getConnection();
            yield connection.query(`
      CREATE TABLE IF NOT EXISTS guns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
        category VARCHAR(255)
      )`);
            for (const [category, gunList] of Object.entries(guns)) {
                for (const gun of gunList) {
                    //make sure the GL sidearm isn't put in the table
                    if (gun !== "M32A1") {
                        yield connection.query(`INSERT INTO guns (name, category) VALUES (?, ?) ON DUPLICATE KEY UPDATE category=VALUES(category)`, [gun, category]);
                    }
                }
            }
            connection.release();
            console.log("Gun data saved to database.");
        }
        catch (error) {
            console.error("Error scraping guns:", error);
        }
    });
}
exports.default = scrapeGuns;
