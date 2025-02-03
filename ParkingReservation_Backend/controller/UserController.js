import dotenv from 'dotenv';
dotenv.config();
import { UserModel, SlotModel, BookingModel } from "../Posgres/postgres.js"
import bcrypt from 'bcrypt'
import { response, text } from "express";
import jwt from 'jsonwebtoken'
import sgMail from '@sendgrid/mail';
import { Sequelize, Op } from 'sequelize';



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
    try {
        const users = await UserModel.findAll();
        if (users.length == 0) {
            return res.status(200).json({ "error": "users not found" })
        }
        return res.status(200).json(users)
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
    let { UserName, email } = req.body;

    let password = ((Math.floor(Math.random() * (9999 - 1000) + 1)) + 1000) + "";
    console.log(password)
    //add code to automatically generate email and send to the user
    sgMail.setApiKey(process.env.API_KEY);
    const message = {
        to: email,
        from: "ayeshaMubasher28@gmail.com",
        subject: "Your Login Code for Unlock Me",
        text: "password: " + password,
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: auto;
        }
        .header {
          text-align: center;
          color: #333333;
        }
        .code {
          display: block;
          font-size: 24px;
          font-weight: bold;
          color: #007BFF;
          margin-top: 20px;
          text-align: center;
        }
        .footer {
          text-align: center;
          color: #888888;
          margin-top: 30px;
          font-size: 12px;
        }
        .footer a {
          color: #007BFF;
          text-decoration: none;
        }
      </style>
    </head>
    <body>

      <div class="container">
        <div class="header">
          <h2>Welcome to Unlock Me</h2>
          <p>To securely log into your account, please use the following password:</p>
        </div>

        <div class="code">
          ${password} <!-- Insert the dynamically generated code here -->
        </div>

        <div class="footer">
          <p>If you need assistance, feel free to reach out to us at <a href="ayeshamubasher28@gmail.com">ayeshamubasher28@gmail.com</a>.</p>
          <p>Best regards, <br>The Unlock Me Team</p>
        </div>
      </div>

    </body>
    </html>
  `,
    };

    sgMail
        .send(message)
        .then((response) => console.log('Email sent'))
        .catch((error) => console.log(error.message));



    password = await bcrypt.hash(password, 10)// password encryption 


    const data = {
        UserName, email, password
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

//used in profile 
export const updateUser = async (req, res) => {
    let UserId = req.user.userId;
    try {
        console.log("User id to get", UserId);
        const usr = await UserModel.update(req.body, { where: { UserId: UserId } })
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
    let { SlotName } = req.body;

    try {
        const slot = await SlotModel.findOne({ where: { SlotName: SlotName } })
        if (slot == null) {
            await SlotModel.create(req.body);
            return res.status(201).json({ message: "Slot added successfully" })
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
    let { SlotId } = req.body;
    try {
        console.log("User id to get", SlotId);
        const slot = await SlotModel.update(req.body, { where: { SlotId: SlotId } })
        console.log("User id result", slot);
        if (slot[0] == 0) {
            return res.status(404).json({ message: "Not found!" })
        }
        return res.status(200).json({ message: "updated successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//For All Slots
export const getAllSlots = async (req, res) => {
    try {
        const slots = await SlotModel.findAll();
        console.log("slots: ", slots);
        if (slots.length == 0) {
            return res.status(200).json({ "error": "no slot found" })
        }
        return res.status(200).json(slots)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//For Single slot
export const getOneSlot = async (req, res) => {
    let { SlotName } = req.body; //slot id
    try {
        const slot = await SlotModel.findOne({ where: { SlotName: SlotName } })
        if (slot == null) {
            return res.status(404).json({ message: "User not found" })
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
    let SlotId = req.params.id;
    console.log("Slot Id", SlotId)
    try {
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

        const data = {
            UserId, SlotId, vehicleNumber, start_time, end_time, totalPrice
        }
        console.log(data);
        await BookingModel.create(data);


        sgMail.setApiKey(process.env.API_KEY);
        const message = {
            to: email,
            from: "ayeshaMubasher28@gmail.com",
            subject: "EasyPark: Booking Confirmation",
            text: "Booking Info!",
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f7fc;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    background-color: #ffffff;
                    width: 100%;
                    max-width: 600px;
                    margin: 30px auto;
                    border-radius: 8px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #0066cc;
                    padding: 20px;
                    color: #ffffff;
                    text-align: center;
                }
                .header h2 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .content p {
                    font-size: 16px;
                    color: #333;
                }
                .content .booking-details {
                    border: 1px solid #e1e1e1;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                .content .booking-details h3 {
                    font-size: 18px;
                    color: #0066cc;
                }
                .content .booking-details p {
                    margin: 10px 0;
                }
                .footer {
                    background-color: #f1f1f1;
                    padding: 15px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
                .footer a {
                    color: #0066cc;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
                .highlight {
                    color: #0066cc;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>

            <div class="email-container">
                <!-- Header -->
                <div class="header">
                    <h2>Booking Confirmation</h2>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <p>Dear <strong>${UserName}</strong>,</p>
                    <p>We are excited to inform you that your booking has been successfully confirmed! Below are the details of your reservation:</p>
                    
                    <div class="booking-details">
                        <h3>Booking Details</h3>
                        <p><strong>Booking Spot:</strong> ${SlotName}</p>
                        <p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
                        <p><strong>Start Time:</strong> ${start_time}</p>
                        <p><strong>End Time:</strong> ${end_time}</p>
                        <p><strong>Total Price:</strong> Rs.${totalPrice}</p>
                    </div>
                    
                    <p>If you have any questions or need further assistance, please feel free to contact us at <a href="mailto:ayeshaMubasher28@gmail.com">ayeshaMubasher28@gmail.com</a>.</p>
                    <p>Thank you for choosing us for your booking!</p>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p>Best Regards,<br> The EasyPark Team</p>
                    <p><a href="mailto:ayeshaMubasher28@gmail.com">Contact Support</a></p>
                </div>
            </div>

        </body>
        </html>

        `,
        };

        sgMail
            .send(message)
            .then((response) => console.log('Email sent'))
            .catch((error) => console.log(error.message));

        return res.status(201).json({ message: "Slot added successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
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
        const data = {
            UserId, SlotId, vehicleNumber, start_time, end_time, totalPrice
        }
        console.log("data to be updated:", data)
        const booking = await BookingModel.update(data, { where: { BookingId: BookingId } })
        console.log("User id result", booking);
        if (booking[0] == 0) {
            return res.status(404).json({ message: "Not found!" })
        }


        sgMail.setApiKey(process.env.API_KEY);
        const message = {
            to: email,
            from: "ayeshaMubasher28@gmail.com",
            subject: "EasyPark: Your Booking Has Been Updated",
            text: "Booking Info Updated!",
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Update</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f7fc;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    background-color: #ffffff;
                    width: 100%;
                    max-width: 600px;
                    margin: 30px auto;
                    border-radius: 8px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #0066cc;
                    padding: 20px;
                    color: #ffffff;
                    text-align: center;
                }
                .header h2 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .content p {
                    font-size: 16px;
                    color: #333;
                }
                .content .booking-details {
                    border: 1px solid #e1e1e1;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                .content .booking-details h3 {
                    font-size: 18px;
                    color: #0066cc;
                }
                .content .booking-details p {
                    margin: 10px 0;
                }
                .footer {
                    background-color: #f1f1f1;
                    padding: 15px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
                .footer a {
                    color: #0066cc;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
                .highlight {
                    color: #0066cc;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>

            <div class="email-container">
                <!-- Header -->
                <div class="header">
                    <h2>Booking Has Been Updated</h2>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <p>Dear <strong>${UserName}</strong>,</p>
                    <p>We would like to inform you that your booking has been successfully updated! Below are the updated details of your reservation:</p>
                    
                    <div class="booking-details">
                        <h3>Booking Details</h3>
                        <p><strong>Booking Spot:</strong> ${SlotName}</p>
                        <p><strong>Vehicle Number:</strong> ${vehicleNumber}</p>
                        <p><strong>Start Time:</strong> ${start_time}</p>
                        <p><strong>End Time:</strong> ${end_time}</p>
                        <p><strong>Total Price:</strong> Rs.${totalPrice}</p>
                    </div>
                    
                    <p>If you have any questions or need further assistance, please feel free to contact us at <a href="mailto:ayeshaMubasher28@gmail.com">ayeshaMubasher28@gmail.com</a>.</p>
                    <p>Thank you for choosing us for your booking!</p>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p>Best Regards,<br> The EasyPark Team</p>
                    <p><a href="mailto:ayeshaMubasher28@gmail.com">Contact Support</a></p>
                </div>
            </div>

        </body>
        </html>

        `,
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

//For All Booking
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await BookingModel.findAll();
        if (bookings.length == 0) {
            return res.status(200).json({ "error": "no slot found" })
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
        const message = {
            to: email,
            from: "ayeshaMubasher28@gmail.com",
            subject: "EasyPark: Your Booking Has Been Canceled",
            text: "Your booking has been successfully canceled.",
            html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Update</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f7fc;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    background-color: #ffffff;
                    width: 100%;
                    max-width: 600px;
                    margin: 30px auto;
                    border-radius: 8px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #0066cc;
                    padding: 20px;
                    color: #ffffff;
                    text-align: center;
                }
                .header h2 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .content p {
                    font-size: 16px;
                    color: #333;
                }
                .content .booking-details {
                    border: 1px solid #e1e1e1;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                .content .booking-details h3 {
                    font-size: 18px;
                    color: #0066cc;
                }
                .content .booking-details p {
                    margin: 10px 0;
                }
                .footer {
                    background-color: #f1f1f1;
                    padding: 15px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
                .footer a {
                    color: #0066cc;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
                .highlight {
                    color: #0066cc;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>

            <div class="email-container">
                <!-- Header -->
                <div class="header">
                    <h2>Your Booking Has Been Canceled</h2>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <p>Dear <strong>${UserName}</strong>,</p>
                    <p>We are writing to confirm that your reservation has been successfully canceled. Below are the details of the canceled booking:</p>
                    <div class="booking-details">
                        <h3>Booking Details</h3>
                        <p><strong>Booking Spot:</strong> ${SlotName}</p>
                        <p><strong>Vehicle Number:</strong> ${booking.vehicleNumber}</p>
                        <p><strong>Start Time:</strong> ${booking.start_time}</p>
                        <p><strong>End Time:</strong> ${booking.end_time}</p>
                        <p><strong>Total Price:</strong> Rs.${booking.totalPrice}</p>
                    </div>
                    
                     <p>If this cancellation was made in error, or if you would like to book a new spot, feel free to visit our platform to make a new reservation.</p>
                    <p>If you have any questions or need further assistance, please feel free to contact us at <a href="mailto:ayeshaMubasher28@gmail.com">ayeshaMubasher28@gmail.com</a>.</p>
                    <p>Thank you for choosing us for your booking!</p>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p>Best Regards,<br> The EasyPark Team</p>
                    <p><a href="mailto:ayeshaMubasher28@gmail.com">Contact Support</a></p>
                </div>
            </div>

        </body>
        </html>

        `,
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

export const getUserBookings = async (req, res) => {
    let UserId = req.user.userId;
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
            return res.status(404).json({ "error": "no booking found" })
        }
        return res.status(200).json(bookings)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}


//#endregion

