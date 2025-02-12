import dotenv from 'dotenv';
dotenv.config();
import { UserModel, SlotModel, BookingModel, RoleModel } from "../Posgres/postgres.js"
import bcrypt from 'bcrypt'
import { response, text } from "express";
import jwt from 'jsonwebtoken'
import sgMail from '@sendgrid/mail';
import ejs from 'ejs'
import path from 'path'
import { Sequelize, Op } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


//#region Slot

//Adding slot
export const addSlot = async (req, res) => {
    console.log(req.body);
    let { SlotName, } = req.body;

    try {
        const slot = await SlotModel.findOne({ where: { SlotName: SlotName } })
        if (slot == null) {
            await SlotModel.create(req.body);
            return res.status(200).json({ message: "Slot added successfully" })
        }
        else {
            return res.status(501).json({ error: "already found" })
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//Update slot
export const updateSlot = async (req, res) => {
    console.log("update slot is called with data ", req.body)
    let { SlotId } = req.body;
    try {
        console.log("User id to get", SlotId);
        const slot = await SlotModel.update(req.body, { where: { SlotId: SlotId } })
        console.log("User id result", slot);
        return res.status(200).json({ message: "updated successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//For All Slots
export const getAllSlots = async (req, res) => {
    console.log("get all slots called")
    try {
        const slots = await SlotModel.findAll();
        console.log("slots: ", slots);
        if (slots.length == 0) {
            return res.status(401).json({ "error": "no slot found" })
        }
        return res.status(200).json(slots)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//For Single slot for getting price used to calcultate booking total
export const getOneSlot = async (req, res) => {
    let { SlotName } = req.body; //slot Name
    try {
        const slot = await SlotModel.findOne({ where: { SlotName: SlotName } })
        if (slot == null) {
            return res.status(404).json({ message: "Slot not found" })
        }
        return res.status(200).json(slot)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

export const getOneSlotWithId = async (req, res) => {
    let { SlotId } = req.body; //slot id
    try {
        const slot = await SlotModel.findOne({ where: { SlotId: SlotId } })
        if (slot == null) {
            return res.status(404).json({ message: "Slot not found" })
        }
        return res.status(200).json(slot)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//For deleting Slot
export const deleteSlot = async (req, res) => {
    let { SlotId } = req.body;
    console.log("Slot Id", SlotId)
    try {

        const bookings = await BookingModel.findAll({ where: { SlotId: SlotId } });
        if (bookings.length != 0) {
            return res.status(401).json({ message: "you cannot delete slots with bookings" })
        }
        const slot = await SlotModel.findOne({ where: { SlotId: SlotId } })
        if (slot == null) {
            return res.status(404).json({ message: "Slot not found" })
        }
        await slot.destroy();
        return res.status(200).json({ message: "deleted successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//for adding new record 
export const getAvalibleSlots = async (req, res) => {
    let { start_time, end_time } = req.body;
    console.log("start_time", start_time)
    console.log("end_time", end_time)
    try {
        const bookedSlots = await BookingModel.findAll({
            attributes: ['SlotId'],
            where: {
                [Sequelize.Op.or]: [
                    {
                        start_time: {
                            [Sequelize.Op.lt]: end_time,
                        },
                        end_time: {
                            [Sequelize.Op.gt]: start_time,
                        },
                    },
                    {
                        start_time: {
                            [Sequelize.Op.eq]: start_time,
                        },
                    },
                    {
                        end_time: {
                            [Sequelize.Op.eq]: end_time,
                        },
                    },
                ],
            },
        });

        // Extract SlotIds from the query result
        const bookedSlotIds = bookedSlots.map((booking) => booking.SlotId);

        console.log("booked ids", bookedSlotIds)
        // Query available slots
        const availableSlots = await SlotModel.findAll({
            where: {
                SlotId: {
                    [Sequelize.Op.notIn]: bookedSlotIds, // Use the extracted SlotIds
                },
            },
        });

        const availableSlotsNames = availableSlots.map((slot) => slot.SlotName)
        console.log(availableSlotsNames);

        return res.status(200).json(availableSlotsNames);
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

export const getAvalibleSlotsInEdit = async (req, res) => {
    let { start_time, end_time, BookingId } = req.body;
    console.log("start_time", start_time)
    console.log("end_time", end_time)
    try {

        const bookedSlots = await BookingModel.findAll({
            attributes: ['SlotId'],
            where: {
                [Sequelize.Op.and]: [
                    {
                        [Sequelize.Op.or]: [
                            {
                                start_time: {
                                    [Sequelize.Op.lt]: end_time,
                                },
                                end_time: {
                                    [Sequelize.Op.gt]: start_time,
                                },
                            },
                            {
                                start_time: {
                                    [Sequelize.Op.eq]: start_time,
                                },
                            },
                            {
                                end_time: {
                                    [Sequelize.Op.eq]: end_time,
                                },
                            },
                        ],
                    },
                    {
                        BookingId: {
                            [Sequelize.Op.ne]: BookingId,
                        },
                    },
                ],
            },
        });


        // Extract SlotIds from the query result
        const bookedSlotIds = bookedSlots.map((booking) => booking.SlotId);

        console.log("booked ids", bookedSlotIds)
        // Query available slots
        const availableSlots = await SlotModel.findAll({
            where: {
                SlotId: {
                    [Sequelize.Op.notIn]: bookedSlotIds, // Use the extracted SlotIds
                },
            },
        });

        const availableSlotsNames = availableSlots.map((slot) => slot.SlotName)
        console.log(availableSlotsNames);

        return res.status(200).json(availableSlotsNames);
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}
//#endregion
