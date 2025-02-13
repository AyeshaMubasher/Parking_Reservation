import express from "express";
import { verifyAdmin, verifyToken, getAllUsers, addUser, updateUserRights, updateUser, updatePassword, deleteUser, checkUser, getUserData, getOneUser } from "../controller/UserController.js";
import { getOneRole, getAllRoles } from "../controller/RoleController.js"
import { addSlot, updateSlot, getAllSlots, getOneSlot, getOneSlotWithId, deleteSlot, getAvalibleSlots, getAvalibleSlotsInEdit } from "../controller/SlotController.js"
import { addBooking, updateBooking, getAllBookings, getOneBooking, deleteBooking, getUserBookings } from "../controller/BookingController.js"
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs"
import cors from 'cors';

const router = express.Router();

const app = express();

// Get the directory name from the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use CORS to allow requests from the frontend (running on localhost:4200)
const corsOptions = {
    origin: 'http://localhost:4200', // Allow requests from the frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));  // Enable CORS with the configured options

// Add this line to serve files in the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Check if the 'uploads' directory exists, if not, create it
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Uploads directory created.');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads'); // This points to your 'uploads' directory
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Filename with timestamp
    }
});
const upload = multer({ storage: storage }).single('profileImage');

/*
app.get('/uploads/:image', (req, res) => {
    console.log("Uploads calling");
    const image = req.params.image;
    res.sendFile(path.join(__dirname, 'uploads', image));
  });
  */

router.put("/user/update", verifyToken, upload, updateUser);

router.get("/verifyAdmin", verifyToken, verifyAdmin);

router.get("/getAll", verifyToken, getAllUsers);
router.post("/addUser", addUser);
router.put("/user/updateUserRights", updateUserRights);
router.put("/updatePassword", verifyToken, updatePassword);
router.delete("/user/:id", deleteUser);
router.post("/user/check", checkUser);
router.get("/user/getUser", verifyToken, getUserData);
router.post("/getOneUser", getOneUser);



router.post("/addSlot", addSlot);
router.put("/updateSlot", updateSlot);
router.get("/getAllSlots", getAllSlots);
router.post("/getOneSlot", getOneSlot);
router.post("/getOneSlotWithId", getOneSlotWithId);
router.post("/deleteSlot", deleteSlot);
router.post("/getAvaliableSlots", getAvalibleSlots);
router.post("/getAvaliableSlotsInEdit", getAvalibleSlotsInEdit);

router.post("/addBooking", verifyToken, addBooking);
router.put("/updateBooking", verifyToken, updateBooking);
router.get("/getAllBookings", getAllBookings);
router.post("/getOneBooking", verifyToken, getOneBooking);
router.post("/deleteBooking", verifyToken, deleteBooking);
router.get("/getUserBookings", verifyToken, getUserBookings);

router.post("/getOneRole", getOneRole);
router.get("/getAllRoles", getAllRoles);

export default router;