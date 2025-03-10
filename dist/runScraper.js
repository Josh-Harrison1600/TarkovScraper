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
const armor_1 = __importDefault(require("./armor"));
const backpacks_1 = __importDefault(require("./backpacks"));
const guns_1 = __importDefault(require("./guns"));
const helmets_1 = __importDefault(require("./helmets"));
const rigs_1 = __importDefault(require("./rigs"));
function runAllScrapers() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Running all scrapers manually...");
        yield (0, armor_1.default)();
        yield (0, backpacks_1.default)();
        yield (0, guns_1.default)();
        yield (0, helmets_1.default)();
        yield (0, rigs_1.default)();
        console.log("All scrapers executed successfully.");
    });
}
runAllScrapers();
