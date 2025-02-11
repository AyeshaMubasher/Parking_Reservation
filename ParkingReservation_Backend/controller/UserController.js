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



//for verifying token
export const verifyToken = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ message: "Access Denied" });
    }
    try {
        const decoded = jwt.verify(
            token.split(" ")[1],
            process.env.JWT_Secret_Key
        );
        req.user = decoded;
        console.log("from verify token ", req.user.userId)
        next();
    }
    catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ message: "Invalid Token" });
    }
}


//#region User data
//used in home page and edit profile page 
export const getAllUsers = async (req, res) => {
    let UserId = req.user.userId;
    try {
        //const users = await UserModel.findAll();
        const excludedUserIds = [1, UserId]
        console.log("user ides to exclude",excludedUserIds)
        const usersWithRoles = await UserModel.findAll({
            where: {
                UserId: {
                    [Sequelize.Op.notIn]: excludedUserIds  // Ensure UserId is not equal to 1
                }
            },
            include: {
                model: RoleModel,
                attributes: ['RoleId', 'RoleName'],  // Specify the columns you need from the Role model
              },
        });

        if (usersWithRoles.length == 0) {
            return res.status(404).json({ "error": "users not found" })
        }
        return res.status(200).json(usersWithRoles)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//user Login
export const checkUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ where: { email: email } });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password)
            if (isMatch) {
                const token = jwt.sign({ userId: user.UserId }, process.env.JWT_Secret_Key, {
                    expiresIn: "5h"
                });
                return res.json({ token });
            }
            return res.status(401).json({ "error": "Password Incorrect!" })
        }
        else {
            return res.status(404).json({ "error": "user not found" })
        }

    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//used at home page,profile page, get single user data
export const getUserData = async (req, res) => {
    let UserId = req.user.userId;
    console.log("User Id", UserId)
    try {
        const usr = await UserModel.findOne({ where: { UserId: UserId } })
        console.log("user: ",usr)
        if (usr == null) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(usr)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

export const getOneUser = async (req, res) => {
    let {UserId} = req.body;
    console.log("User Id", UserId)
    try {
        const usr = await UserModel.findOne({ where: { UserId: UserId } })
        console.log("user: ",usr)
        if (usr == null) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(usr)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//use in register
export const addUser = async (req, res) => {
    console.log(req.body);
    let { UserName, email, PhoneNumber } = req.body;

    let password = ((Math.floor(Math.random() * (9999 - 1000) + 1)) + 1000) + "";
    console.log(password)
    //add code to automatically generate email and send to the user
    sgMail.setApiKey(process.env.API_KEY);

    const emailBody = await renderEmailTemplateAddUser(password);

    const message = {
        to: email,
        from: 'ayeshaMubasher28@gmail.com',
        subject: 'Your Login Code for Unlock Me',
        text: 'password: ' + password,
        html: emailBody, // Rendered HTML body
    };

    sgMail
        .send(message)
        .then((response) => console.log('Email sent'))
        .catch((error) => console.log(error.message));



    password = await bcrypt.hash(password, 10)// password encryption 


    const data = {
        UserName, email, password, PhoneNumber
    }
    try {
        const usr = await UserModel.findOne({ where: { email: email } })
        if (usr == null) {
            await UserModel.create(data);
            return res.status(201).json({ message: "User added successfully" })
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
const renderEmailTemplateAddUser = async (password) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatePath = path.join(__dirname, 'views', 'User_Password_Email.ejs');
    const emailBody = await ejs.renderFile(templatePath, { password });

    return emailBody;
};

//used in profile 
export const updateUser = async (req, res) => {
    let {UserId,UserName,Role} = req.body;
    try {

        const role = await RoleModel.findOne({ where: { RoleName: Role } })

        const exsistingUsr = await UserModel.findOne({ where: { UserId: UserId } })


        const data={
            UserName:UserName,
            RoleId:role.RoleId,
            email:exsistingUsr.email,
            password:exsistingUsr.password,
            PhoneNumber:exsistingUsr.PhoneNumber
        }
        console.log("User id to get", UserId);

        console.log("data for update",data)
        const usr = await UserModel.update(data, { where: { UserId: UserId } })
        console.log("User id result", usr);
        if (usr[0] == 0) {
            return res.status(404).json({ message: "Not found!" })
        }
        return res.status(200).json({ message: "updated successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

export const deleteUser = async (req, res) => {
    let UserId = req.params.id;
    try {
        const usr = await UserModel.findOne({ where: { UserId: UserId } })
        if (usr == null) {
            return res.status(404).json({ message: "User not found" })
        }
        await usr.destroy();
        return res.status(200).json({ message: "deleted successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//#endregion

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
    console.log("update slot is called with data ",req.body)
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

//#region Booking

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


                sgMail.setApiKey(process.env.API_KEY);

                const bookingData = {
                    UserName: UserName,
                    SlotName: SlotName,
                    vehicleNumber: vehicleNumber,
                    start_time: start_time,
                    end_time: end_time,
                    totalPrice: totalPrice,
                };
                const emailBody = await renderEmailTemplateAddBooking(bookingData);

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
const renderEmailTemplateAddBooking = async (data) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatePath = path.join(__dirname, 'views', 'bookingConfirmation.ejs');
    const emailBody = await ejs.renderFile(templatePath, data);

    return emailBody;
};

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


        sgMail.setApiKey(process.env.API_KEY);
        const emailBody = await renderEmailTemplateUpdateBooking(bookingData);

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

        return res.status(200).json({ message: "updated successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}
const renderEmailTemplateUpdateBooking = async (data) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatePath = path.join(__dirname, 'views', 'bookingUpdate.ejs');
    const emailBody = await ejs.renderFile(templatePath, data);

    return emailBody;
};

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


        sgMail.setApiKey(process.env.API_KEY);

        const bookingData = {
            UserName: UserName,
            SlotName: SlotName,
            vehicleNumber: booking.vehicleNumber,
            start_time: booking.start_time,
            end_time: booking.end_time,
            totalPrice: booking.totalPrice,
        };

        const emailBody = await renderEmailTemplateDeleteBooking(bookingData);

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

        return res.status(200).json({ message: "deleted successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}
const renderEmailTemplateDeleteBooking = async (data) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatePath = path.join(__dirname, 'views', 'bookingCancellation.ejs');
    const emailBody = await ejs.renderFile(templatePath, data);

    return emailBody;
};

export const getUserBookings = async (req, res) => {
    let UserId = req.user.userId;
    console.log("get bookings with id",UserId)
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
            return res.status(404).json({ message: "Booking not found"})
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

//#endregion

//#region Role

export const getOneRole = async (req, res) => {
    let { RoleId } = req.body; //Role
    try {
        const role = await RoleModel.findOne({ where: { RoleId: RoleId } })
        if (role == null) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json(role)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

export const getAllRoles = async (req, res) => {
    try {
        const role = await RoleModel.findAll({
            where: {
                RoleId: {
                    [Sequelize.Op.ne]: 1  // Ensure UserId is not equal to 1
                }
        }})
        const Roles = role.map((role) => role.RoleName)
        console.log(Roles);
        return res.status(200).json(Roles)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//#endregion