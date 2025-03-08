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
function scrapeArmor() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield axios_1.default.get("https://escapefromtarkov.fandom.com/wiki/Armor_vests");
            console.log("Fetched HTML for Armor Vests");
            const $ = (0, cheerio_1.load)(data);
            const armor = [];
            $('table.wikitable tbody tr').each((_, row) => {
                const armorName = $(row).find('th a').text().trim();
                if (armorName) {
                    console.log("Found armor:", armorName);
                    armor.push(armorName);
                }
            });
            const connection = yield db_1.default.getConnection();
            yield connection.query(`CREATE TABLE IF NOT EXISTS armor (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE)`);
            for (const item of armor) {
                yield connection.query(`INSERT INTO armor (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name`, [item]);
            }
            connection.release();
            console.log("Armor data saved to database.");
        }
        catch (error) {
            console.error("Error scraping armor vests:", error);
        }
    });
}
exports.default = scrapeArmor;
