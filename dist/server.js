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
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const app = (0, express_1.default)();
// Explicitly set CORS to allow requests from your frontend
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "x-api-key"],
}));
// Middleware to handle CORS preflight requests
app.options("*", (req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    });
    res.sendStatus(200);
    next();
});
// Rate Limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many requests, try again later" },
    headers: true,
});
app.use((req, res, next) => limiter(req, res, next));
// Allowed endpoints
const endpoints = ["armor", "backpacks", "helmets", "guns", "rigs"];
// Function to fetch data from the database
const fetchData = (table, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate that the table name is allowed
        if (!endpoints.includes(table)) {
            return res.status(400).json({
                error: "Invalid table name",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
                }
            });
        }
        const query = `SELECT * FROM ??`;
        const [rows] = yield db_1.default.query(query, [table]);
        return res.status(200)
            .set({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-api-key",
        })
            .json({ [table]: rows });
    }
    catch (error) {
        console.error(`Error fetching ${table}:`, error);
        return res.status(500)
            .set({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-api-key",
        })
            .json({ error: `Failed to fetch ${table} data` });
    }
});
// Generate the routes
endpoints.forEach(endpoint => {
    app.get(`/${endpoint}`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield fetchData(endpoint, res);
    }));
});
module.exports.handler = (0, serverless_http_1.default)(app);
