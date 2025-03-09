import express, { Request, Response, NextFunction } from "express";
import rateLimit from 'express-rate-limit';
import cors from "cors";
import db from "./db";
import serverless from "serverless-http";

const app = express();

// Explicitly set CORS to allow requests from your frontend
app.use(cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "x-api-key"],
}));

// Middleware to handle CORS preflight requests
app.options("*", (req: Request, res: Response, next: NextFunction) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    });
    res.sendStatus(200);
    next();
});


// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many requests, try again later" },
    headers: true,
});
app.use((req: Request, res: Response, next: NextFunction) => limiter(req, res, next));

// Allowed endpoints
const endpoints = ["armor", "backpacks", "helmets", "guns", "rigs"] as const;
type TableName = (typeof endpoints)[number];

// Function to fetch data from the database
const fetchData = async (table: TableName, res: Response) => {
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
        const [rows] = await db.query(query, [table]);

        return res.status(200)
            .set({
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, x-api-key",
            })
            .json({ [table]: rows });
    } catch (error) {
        console.error(`Error fetching ${table}:`, error);
        return res.status(500)
            .set({
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, x-api-key",
            })
            .json({ error: `Failed to fetch ${table} data` });
    }
};


// Generate the routes
endpoints.forEach(endpoint => {
    app.get(`/${endpoint}`, async (req: Request, res: Response) => {
        await fetchData(endpoint, res);
    });
}); 

module.exports.handler = serverless(app);
