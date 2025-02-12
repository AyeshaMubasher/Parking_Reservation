import express from "express";
import { getAllUsers, addUser,updateUserRights, updateUser, updatePassword, deleteUser, checkUser, verifyToken, getUserData,addSlot,updateSlot,getAllSlots,getOneSlot, deleteSlot,getAvalibleSlots, addBooking, updateBooking,getAllBookings,getOneBooking,deleteBooking, getUserBookings, getAvalibleSlotsInEdit, getOneRole, getOneSlotWithId,getOneUser,getAllRoles,verifyAdmin } from "../controller/UserController.js";
const router = express.Router();

router.get("/verifyAdmin",verifyToken,verifyAdmin);

router.get("/getAll",verifyToken,getAllUsers);
router.post("/addUser",addUser);
router.put("/user/updateUserRights",updateUserRights);
router.put("/user/update",verifyToken,updateUser);
router.put("/updatePassword",verifyToken,updatePassword);
router.delete("/user/:id",deleteUser);
router.post("/user/check",checkUser);
router.get("/user/getUser",verifyToken,getUserData);
router.post("/getOneUser",getOneUser);

router.post("/addSlot",addSlot);
router.put("/updateSlot",updateSlot);
router.get("/getAllSlots",getAllSlots);
router.post("/getOneSlot",getOneSlot);
router.post("/getOneSlotWithId",getOneSlotWithId);
router.post("/deleteSlot",deleteSlot);
router.post("/getAvaliableSlots",getAvalibleSlots);
router.post("/getAvaliableSlotsInEdit",getAvalibleSlotsInEdit);

router.post("/addBooking",verifyToken,addBooking);
router.put("/updateBooking",verifyToken,updateBooking);
router.get("/getAllBookings",getAllBookings);
router.post("/getOneBooking",verifyToken,getOneBooking);
router.post("/deleteBooking",verifyToken,deleteBooking);
router.get("/getUserBookings",verifyToken,getUserBookings);

router.post("/getOneRole",getOneRole);
router.get("/getAllRoles",getAllRoles);

export default router;