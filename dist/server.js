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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const app = (0, express_1.default)();
const PORT = 3000;
//cors so frontend can access the api
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET"],
}));
//routes
const endpoints = ["armor", "backpacks", "helmets", "guns", "rigs"];
//Function to fetch data from all the tables
const fetchData = (table, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield db_1.default.query(`SELECT * FROM ${table}`);
        res.json({ [table]: rows });
    }
    catch (error) {
        console.error(`Error fetching ${table}:`, error);
        res.status(500).json({ error: `Failed to fetch ${table} data` });
    }
});
//generate the routes
endpoints.forEach(endpoint => {
    app.get(`/${endpoint}`, (req, res) => fetchData(endpoint, res));
});
module.exports.handler = (0, serverless_http_1.default)(app);
