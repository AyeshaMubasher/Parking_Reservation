import express from 'express';
import { connection } from './Posgres/postgres.js';
import router from './view/routes.js';
import cors from 'cors'
import path from "path"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from "fs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app=express();
app.use(express.json())
app.use(cors())

console.log("path--------------------->",path.join(__dirname,'view', 'uploads'))
app.use('/uploads', express.static(path.join(__dirname,'view', 'uploads')));

// Check if the 'uploads' directory exists, if not, create it
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Uploads directory created.');
}


app.use(router)

// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Export app for external use
export { app };

const PORT = process.env.PORT || 8000;

app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`)
});

connection();
