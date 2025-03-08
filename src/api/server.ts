import express, { Request, Response } from "express";
import cors from "cors";
import db from "./db";

const app = express();
const PORT = 3000;

//cors so frontend can access the api
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET"],
}));

//routes
const endpoints = ["armor", "backpacks", "helmets", "guns", "rigs"] as const;
type TableName = (typeof endpoints)[number];

//Function to fetch data from all the tables
const fetchData = async (table: TableName, res: Response) => {
    try{
        const [rows] = await db.query(`SELECT * FROM ${table}`);
        res.json({ [table]: rows});
    }catch(error){
        console.error(`Error fetching ${table}:`, error);
        res.status(500).json({ error: `Failed to fetch ${table} data`});
    }
};

//generate the routes
endpoints.forEach(endpoint => {
    app.get(`/${endpoint}`, (req: Request, res: Response) => fetchData(endpoint, res));
});

//start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});