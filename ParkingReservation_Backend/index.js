import express from 'express';
import { connection } from './Posgres/postgres.js';
import router from './view/routes.js';
import cors from 'cors'
import path from "path"
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app=express();
app.use(express.json())
app.use(cors())

console.log("path--------------------->",path.join(__dirname,'view', 'uploads'))
app.use('/uploads', express.static(path.join(__dirname,'view', 'uploads')));
app.use(router)

const PORT=8000;

app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`)
});

connection();