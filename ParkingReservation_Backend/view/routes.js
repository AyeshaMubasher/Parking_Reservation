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


// Get the directory name from the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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