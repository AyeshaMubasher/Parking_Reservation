import dotenv from 'dotenv';
dotenv.config();
import { UserModel,SlotModel,BookingModel } from "../Posgres/postgres.js"
import bcrypt from 'bcrypt'
import { response, text } from "express";
import jwt from 'jsonwebtoken'
import sgMail from '@sendgrid/mail';
import { Sequelize, Op } from 'sequelize';



//for verifying token
export const verifyToken= async(req,res,next)=>{
    const token = req.header("Authorization");
    if(!token){
        return res.status(401).json({message:"Access Denied"});
    }
    try{
        const decoded = jwt.verify(
           token.split(" ")[1],
           process.env.JWT_Secret_Key 
        );
        req.user = decoded;
        console.log("from verify token ",req.user.userId)
        next();
    }
    catch (error){
        console.error("Error verifying token:", error);
        res.status(401).json({message:"Invalid Token"});
    }
}


//#region User data
//used in home page and edit profile page 
export const getAllUsers=async(req,res)=>{
    try{
    const users= await UserModel.findAll();
        if(users.length==0){
            return res.status(200).json({"error":"users not found"})
        }
        return res.status(200).json(users)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//user Login
export const checkUser=async(req,res)=>{
    const {email,password}=req.body;
    try{
    const user= await UserModel.findOne({where:{email:email}});
        if(user){
            const isMatch = await bcrypt.compare(password,user.password)
            if(isMatch){
                const token = jwt.sign({userId: user.UserId},process.env.JWT_Secret_Key,{
                    expiresIn: "5h"
                });
                return res.json({token});
                }
                return res.status(401).json({"error":"Password Incorrect!"})
        }
        else{
            return res.status(404).json({"error":"user not found"})
        }
        
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//used at home page,profile page, get single user data
export const getUserData= async(req,res)=>{
    let UserId=req.user.userId;
    console.log("User Id",UserId)
    try{
        const usr= await UserModel.findOne({where:{UserId:UserId}})
        if(usr==null){
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json(usr)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//use in register
export const addUser=async(req,res)=>{
    console.log(req.body);
    let {UserName,email} = req.body;

    let password=((Math.floor(Math.random()*(9999-1000)+1))+1000)+"";
    console.log(password)
    //add code to automatically generate email and send to the user
    sgMail.setApiKey(process.env.API_KEY);
    const message ={
        to: email,
        from: "ayeshaMubasher28@gmail.com",
        subject: "Your Login Code for Unlock Me",
        text: "password: "+password,
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
          <p>To securely log into your account, please use the following code:</p>
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
    .then((response)=> console.log('Email sent'))
    .catch((error)=> console.log(error.message));



    password = await bcrypt.hash(password, 10)// password encryption 

    
    const data={
        UserName,email,password
    }
    try{
        const usr= await UserModel.findOne({where:{email:email}})
        if(usr==null){
            await UserModel.create(data);
            return res.status(201).json({message:"User added successfully"})
        }
        else{
            return res.status(501).json({error:"already found"})
        }
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//used in profile 
export const updateUser=async(req,res)=>{
    let UserId=req.user.userId;
    try{
        console.log("User id to get",UserId);
        const usr=await UserModel.update(req.body,{where:{UserId:UserId}})
        console.log("User id result",usr);
        if(usr[0]==0){
            return res.status(404).json({message:"Not found!"})
        }
        return res.status(200).json({message:"updated successfully"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

export const deleteUser=async(req,res)=>{
    let UserId=req.params.id;
    try{
        const usr= await UserModel.findOne({where:{UserId:UserId}})
        if(usr==null){
            return res.status(404).json({message:"User not found"})
        }
        await usr.destroy();
        return res.status(200).json({message:"deleted successfully"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//#endregion

//#region Slot

//Adding slot
export const addSlot=async(req,res)=>{
    console.log(req.body);
    let {SlotName} = req.body;

    try{
        const slot= await SlotModel.findOne({where:{SlotName:SlotName}})
        if(slot==null){
            await SlotModel.create(req.body);
            return res.status(201).json({message:"Slot added successfully"})
        }
        else{
            return res.status(501).json({error:"already found"})
        }
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//Update slot
export const updateSlot=async(req,res)=>{
    let {SlotId} = req.body;
    try{
        console.log("User id to get",SlotId);
        const slot=await SlotModel.update(req.body,{where:{SlotId:SlotId}})
        console.log("User id result",slot);
        if(slot[0]==0){
            return res.status(404).json({message:"Not found!"})
        }
        return res.status(200).json({message:"updated successfully"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//For All Slots
export const getAllSlots=async(req,res)=>{
    try{
    const slots= await SlotModel.findAll();
    console.log("slots: ",slots);
        if(slots.length==0){
            return res.status(200).json({"error":"no slot found"})
        }
        return res.status(200).json(slots)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//For Single slot
export const getOneSlot= async(req,res)=>{
    let {SlotName}=req.body; //slot id
    try{
        const slot= await SlotModel.findOne({where:{SlotName:SlotName}})
        if(slot==null){
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json(slot)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//For deleting Slot
export const deleteSlot=async(req,res)=>{
    let SlotId = req.params.id;
    console.log("Slot Id",SlotId)
    try{
        const slot= await SlotModel.findOne({where:{SlotId:SlotId}})
        if(slot==null){
            return res.status(404).json({message:"Slot not found"})
        }
        await slot.destroy();
        return res.status(200).json({message:"deleted successfully"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

export const getAvalibleSlots=async(req,res)=>{
    let {start_time,end_time}=req.body;
    console.log("start_time",start_time)
    console.log("end_time",end_time)
    try{
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

          console.log("booked ids",bookedSlotIds)
          // Query available slots
          const availableSlots = await SlotModel.findAll({
            where: {
                SlotId: {
                    [Sequelize.Op.notIn]: bookedSlotIds, // Use the extracted SlotIds
                  },
            },
          });
        
          const availableSlotsNames=availableSlots.map((slot) => slot.SlotName)
          console.log(availableSlotsNames);
          
          return res.status(200).json(availableSlotsNames);
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//#endregion

//#region Booking

//Adding Booking
export const addBooking=async(req,res)=>{
    let {SlotId,vehicleNumber,start_time,end_time}=req.body;
    let UserId=req.user.userId;

    const data={
        UserId,SlotId,vehicleNumber,start_time,end_time
    }

    console.log(data);
    try{
            await BookingModel.create(data);
            return res.status(201).json({message:"Slot added successfully"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//Update Booking
export const updateBooking=async(req,res)=>{
    let {BookingId} = req.body;
    try{
        console.log("User id to get",BookingId);
        const booking=await BookingModel.update(req.body,{where:{BookingId:BookingId}})
        console.log("User id result",booking);
        if(booking[0]==0){
            return res.status(404).json({message:"Not found!"})
        }
        return res.status(200).json({message:"updated successfully"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//For All Booking
export const getAllBookings=async(req,res)=>{
    try{
    const bookings= await BookingModel.findAll();
        if(bookings.length==0){
            return res.status(200).json({"error":"no slot found"})
        }
        return res.status(200).json(bookings)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//For Single Booking
export const getOneBooking= async(req,res)=>{
    let BookingId=req.body; //slot id
    try{
        const booking= await BookingModel.findOne({where:{BookingId:BookingId}})
        if(booking==null){
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json(slot)
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

//For deleting Booking
export const deleteBooking=async(req,res)=>{
    let BookingId = req.params.id;
    try{
        const booking= await BookingModel.findOne({where:{BookingId:BookingId}})
        if(booking==null){
            return res.status(404).json({message:"Slot not found"})
        }
        await usr.destroy();
        return res.status(200).json({message:"deleted successfully"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}

export const getUserBookings=async(req,res)=>{
    let UserId=req.user.userId;
    try{
        const bookings= await BookingModel.findAll({
            where:{UserId:UserId},
            include: [
                {
                  model: SlotModel, // Join with Slot model
                  attributes: ['SlotName'] // Select only the SlotName column
                }
            ]
        });
            if(bookings.length==0){
                return res.status(200).json({"error":"no slot found"})
            }
            return res.status(200).json(bookings)
        }
        catch(error){
            console.log(error)
            return res.status(500).json({"error":"Internal server error"})
        }
}


//#endregion

