import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import db from "./db";
import serverless from "serverless-http";

const app = express();
const PORT = 3000;

//cors so frontend can access the api
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET"],
}));

//enforce api key
app.use((req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"];
    const validApiKey = process.env.API_KEY;

    //check if api key is valid
    if(!apiKey || apiKey !== validApiKey){
        return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
    }
    next();
});

//routes
const endpoints = ["armor", "backpacks", "helmets", "guns", "rigs"] as const;
type TableName = (typeof endpoints)[number];

//Function to fetch data from all the tables
const fetchData = async (table: TableName, res: Response) => {
    try{
        const query = `SELECT * FROM ??`;
        const [rows] = await db.query(query, [table]);
        res.json({ [table]: rows});
    }catch(error){
        console.error(`Error fetching ${table}:`, error);
        res.status(500).json({ error: `Failed to fetch ${table} data`});
    }
};

//generate the routes
endpoints.forEach(endpoint => {
    app.get(`/${endpoint}`, (req: Request, res: Response) => 
        fetchData(endpoint, res));
});

module.exports.handler = serverless(app);
