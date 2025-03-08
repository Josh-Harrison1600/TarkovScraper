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
function scrapeRigs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = yield axios_1.default.get("https://escapefromtarkov.fandom.com/wiki/Chest_rigs");
            console.log("Fetched HTML for Rigs");
            const $ = (0, cheerio_1.load)(data);
            const rigs = [];
            $('table.wikitable tbody tr').each((_, row) => {
                const rigName = $(row).find('th a').text().trim();
                if (rigName) {
                    console.log("Found rig:", rigName);
                    rigs.push(rigName);
                }
            });
            const connection = yield db_1.default.getConnection();
            yield connection.query(`CREATE TABLE IF NOT EXISTS rigs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE)`);
            for (const item of rigs) {
                yield connection.query(`INSERT INTO rigs (name) VALUES (?) ON DUPLICATE KEY UPDATE name=name`, [item]);
            }
            connection.release();
            console.log("Rigs data saved to database.");
        }
        catch (error) {
            console.error("Error scraping rigs:", error);
        }
    });
}
exports.default = scrapeRigs;
