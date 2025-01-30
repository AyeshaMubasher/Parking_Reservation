import express from "express";
import { getAllUsers, addUser, updateUser, deleteUser, checkUser, verifyToken, getUserData,addSlot,updateSlot,getAllSlots,getOneSlot, deleteSlot,getAvalibleSlots, addBooking, updateBooking,getAllBookings,getOneBooking,deleteBooking, getUserBookings, getAvalibleSlotsInEdit } from "../controller/UserController.js";
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
router.post("/getOneSlot",getOneSlot);
router.delete("/deleteSlot/:id",deleteSlot);
router.post("/getAvaliableSlots",getAvalibleSlots);
router.post("/getAvaliableSlotsInEdit",getAvalibleSlotsInEdit);

router.post("/addBooking",verifyToken,addBooking);
router.put("/updateBooking",verifyToken,updateBooking);
router.get("/getAllBookings",getAllBookings);
router.post("/getOneBooking",verifyToken,getOneBooking);
router.post("/deleteBooking",verifyToken,deleteBooking);
router.get("/getUserBookings",verifyToken,getUserBookings);


export default router;