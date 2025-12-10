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



//Adding Booking
export const addBooking = async (req, res) => {
    let { SlotName, vehicleNumber, start_time, end_time, totalPrice } = req.body;
    let UserId = req.user.userId;

    console.log("request ", req.body);

    //#region getting User Data 
    const usr = await UserModel.findOne({ where: { UserId: UserId } })
    const email = usr.email;
    const UserName = usr.UserName;
    //#endregion

    //#region getting SlotId 
    const slot = await SlotModel.findOne({ where: { SlotName: SlotName } })
    const SlotId = slot.SlotId;
    //#endregion

    const currentTime = new Date();

    const formatedTime = await formatDate(currentTime);

    console.log("start time " + start_time + " current time " + formatedTime)
    if (start_time < formatedTime) {
        return res.status(402).json({ "error": "You can not book slot for past time" })
    }
    else if (start_time >= end_time) {
        return res.status(403).json({ "error": "Invalid End time" })
    }
    else {

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
                            SlotId: {
                                [Sequelize.Op.eq]: SlotId,
                            },
                        },
                    ],
                },
            });


            console.log("booked Slot", bookedSlots)

            if (bookedSlots.length == 0) {
                const data = {
                    UserId, SlotId, vehicleNumber, start_time, end_time, totalPrice
                }
                console.log(data);
                await BookingModel.create(data);

/*
                sgMail.setApiKey(process.env.API_KEY);

                const bookingData = {
                    UserName: UserName,
                    SlotName: SlotName,
                    vehicleNumber: vehicleNumber,
                    start_time: start_time,
                    end_time: end_time,
                    totalPrice: totalPrice,
                };
                const emailBody = await renderEmailTemplate(bookingData,'bookingConfirmation.ejs');

                const message = {
                    to: email,
                    from: 'ayeshaMubasher28@gmail.com',
                    subject: 'EasyPark: Booking Confirmation',
                    text: 'Booking Info!',
                    html: emailBody,
                };

                sgMail
                    .send(message)
                    .then((response) => console.log('Email sent'))
                    .catch((error) => console.log(error.message));
*/
                return res.status(201).json({ message: "Slot added successfully" })
            }
            else {
                return res.status(401).json({ "error": "This Slot is already booked" })
            }
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ "error": "Internal server error" })
        }
    }

}

//Update Booking
export const updateBooking = async (req, res) => {
    let { BookingId, SlotName, vehicleNumber, start_time, end_time, totalPrice } = req.body;
    let UserId = req.user.userId;



    //#region getting User Data 
    const usr = await UserModel.findOne({ where: { UserId: UserId } })
    const email = usr.email;
    const UserName = usr.UserName;
    //#endregion

    //#region getting SlotId 
    const slot = await SlotModel.findOne({ where: { SlotName: SlotName } })
    const SlotId = slot.SlotId;
    //#endregion

    try {

        const currentTime = new Date();

        if (start_time < currentTime) {
            return res.status(402).json({ "error": "You can not book slot for past time" })
        }
        else if (start_time >= end_time) {
            return res.status(403).json({ "error": "Invalid End time" })
        }

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


        const data = {
            UserId, SlotId, vehicleNumber, start_time, end_time, totalPrice
        }
        console.log("data to be updated:", data)
        const booking = await BookingModel.update(data, { where: { BookingId: BookingId } })
        console.log("User id result", booking);
        if (booking[0] == 0) {
            return res.status(404).json({ message: "Not found!" })
        }

        const bookingData = {
            UserName: UserName,
            SlotName: SlotName,
            vehicleNumber: vehicleNumber,
            start_time: start_time,
            end_time: end_time,
            totalPrice: totalPrice,
        };

/*
        sgMail.setApiKey(process.env.API_KEY);
        const emailBody = await renderEmailTemplate(bookingData,'bookingUpdate.ejs');

        const message = {
            to: email,
            from: 'ayeshaMubasher28@gmail.com',
            subject: 'EasyPark: Your Booking Has Been Updated',
            text: 'Booking Info Updated!',
            html: emailBody, // Rendered HTML body
        };

        sgMail
            .send(message)
            .then((response) => console.log('Email sent'))
            .catch((error) => console.log(error.message));
*/
        return res.status(200).json({ message: "updated successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//For All Booking
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await BookingModel.findAll();
        if (bookings.length == 0) {
            return res.status(404).json({ "error": "no booking found" })
        }
        return res.status(200).json(bookings)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//For Single Booking to edit 
export const getOneBooking = async (req, res) => {
    console.log("get booking body", req.body)
    let { BookingId } = req.body;
    let UserId = req.user.userId;


    //#region getting User Data 
    const usr = await UserModel.findOne({ where: { UserId: UserId } })
    const email = usr.email;
    const UserName = usr.UserName;
    //#endregion


    try {
        const booking = await BookingModel.findOne({ where: { BookingId: BookingId } })
        if (booking == null) {
            return res.status(404).json({ message: "User not found" })
        }



        //#region getting SlotId 
        const SlotId = booking.SlotId;
        const slot = await SlotModel.findOne({ where: { SlotId: SlotId } })

        const data = {
            vehicleNumber: booking.vehicleNumber,
            start_time: booking.start_time,
            end_time: booking.end_time,
            slotName: slot.SlotName,
            totalPrice: booking.totalPrice,
            price: slot.price
        }
        //#endregion
        return res.status(200).json(data)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//For deleting Booking
export const deleteBooking = async (req, res) => {
    let { BookingId } = req.body;
    let UserId = req.user.userId;
    try {
        const booking = await BookingModel.findOne({ where: { BookingId: BookingId } })
        if (booking == null) {
            return res.status(404).json({ message: "Booking not found" })
        }
        await booking.destroy();
        //await booking.update({ deleted_at: new Date() });

        //#region getting User Data 
        const usr = await UserModel.findOne({ where: { UserId: UserId } })
        const email = usr.email;
        const UserName = usr.UserName;
        //#endregion

        //#region getting SlotId 
        const SlotId = booking.SlotId;
        const slot = await SlotModel.findOne({ where: { SlotId: SlotId } })
        const SlotName = slot.SlotName;

/*
        sgMail.setApiKey(process.env.API_KEY);

        const bookingData = {
            UserName: UserName,
            SlotName: SlotName,
            vehicleNumber: booking.vehicleNumber,
            start_time: booking.start_time,
            end_time: booking.end_time,
            totalPrice: booking.totalPrice,
        };

        const emailBody = await renderEmailTemplate(bookingData,'bookingCancellation.ejs');

        const message = {
            to: email,
            from: 'ayeshaMubasher28@gmail.com',
            subject: 'EasyPark: Your Booking Has Been Canceled',
            text: 'Your booking has been successfully canceled.',
            html: emailBody, // Rendered HTML body
        };

        sgMail
            .send(message)
            .then((response) => console.log('Email sent'))
            .catch((error) => console.log(error.message));
*/
        return res.status(200).json({ message: "deleted successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}
//getting single user bookings 
export const getUserBookings = async (req, res) => {
    let UserId = req.user.userId;
    console.log("get bookings with id", UserId)
    try {
        const bookings = await BookingModel.findAll({
            where: { UserId: UserId },
            include: [
                {
                    model: SlotModel, // Join with Slot model
                    attributes: ['SlotName'] // Select only the SlotName column
                }
            ]
        });
        if (bookings.length == 0) {
            return res.status(404).json({ message: "Booking not found" })
        }
        return res.status(200).json(bookings)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}


const formatDate = async (inputDate) => {
    // Create a Date object from the input string
    const date = new Date(inputDate);

    // Get year, month, day, hours, minutes, and seconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Return the formatted date in YYYY-MM-DD HH:MM:SS format
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


const renderEmailTemplate = async (data,fileName) =>{
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatePath = path.join(__dirname, 'views', fileName);
    const emailBody = await ejs.renderFile(templatePath, data);

    return emailBody;
}
