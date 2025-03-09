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
const node_cron_1 = __importDefault(require("node-cron"));
const armor_1 = __importDefault(require("./armor"));
const backpacks_1 = __importDefault(require("./backpacks"));
const guns_1 = __importDefault(require("./guns"));
const helmets_1 = __importDefault(require("./helmets"));
const rigs_1 = __importDefault(require("./rigs"));
// Scheduled to run once a month, Sunday at midnight
node_cron_1.default.schedule('0 0 * * 0', () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    if (today.getDate() <= 7) {
        console.log("Running Monthly Tarkov Wiki Scraper...");
        yield (0, armor_1.default)();
        yield (0, backpacks_1.default)();
        yield (0, guns_1.default)();
        yield (0, helmets_1.default)();
        yield (0, rigs_1.default)();
        console.log("Scraping complete!");
    }
}));
