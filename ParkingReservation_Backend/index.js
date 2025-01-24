import express from 'express';
import { connection } from './Posgres/postgres.js';
import router from './view/routes.js';
import cors from 'cors'

const app=express();
app.use(express.json())
app.use(cors())
app.use(router)

const PORT=8000;

app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`)
});

connection();