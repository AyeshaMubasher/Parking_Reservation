import express from "express";
import { getAllUsers, addUser, updateUser, deleteUser, checkUser, verifyToken, getUserData,addSlot,updateSlot,getAllSlots,getOneSlot, deleteSlot,getAvalibleSlots, addBooking, updateBooking,getAllBookings,getOneBooking,deleteBooking, getUserBookings } from "../controller/UserController.js";
const router = express.Router();

router.get("/getAll",getAllUsers);
router.post("/addUser",addUser);
router.put("/user/update",verifyToken,updateUser);
router.delete("/user/:id",deleteUser);
router.post("/user/check",checkUser);
router.get("/user/getUser",verifyToken,getUserData);

router.post("/addSlot",addSlot);
router.put("/updateSlot",updateSlot);
router.get("/getAllSlots",getAllSlots);
router.get("/getOneSlot",getOneSlot);
router.delete("/deleteSlot/:id",deleteSlot);
router.get("/getAvaliableSlots",getAvalibleSlots);

router.post("/addBooking",addBooking);
router.put("/updateBooking",updateBooking);
router.get("/getAllBookings",getAllBookings);
router.get("/getOneBooking",getOneBooking);
router.delete("/deleteBooking/:id",deleteBooking);
router.get("/getUserBookings",verifyToken,getUserBookings);


export default router;