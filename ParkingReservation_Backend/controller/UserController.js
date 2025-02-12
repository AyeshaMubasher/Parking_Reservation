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
        return res.status(401).json({ message: "Access Denied"});
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

export const verifyAdmin = async (req, res) => {
    let UserId = req.user.userId;
    try {
        const usr = await UserModel.findOne({ where: { UserId: UserId } })
        if (usr.RoleId == 1 || usr.RoleId == 2) {
            const role={
                RoleId:usr.RoleId
            }
            return res.status(200).json(role)
        }
        else {
            return res.status(401).json({ "error": "This is a user account" })
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}

//#region User data
//used in home page and edit profile page 
export const getAllUsers = async (req, res) => {
    let UserId = req.user.userId;
    try {
        //const users = await UserModel.findAll();
        const excludedUserIds = [1, UserId]
        console.log("user ides to exclude", excludedUserIds)
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
        console.log("user: ", usr)
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

//used at edit user to get user for edit its role 
export const getOneUser = async (req, res) => {
    let { UserId } = req.body;
    console.log("User Id", UserId)
    try {
        const usr = await UserModel.findOne({ where: { UserId: UserId } })
        console.log("user: ", usr)
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
export const updateUser=async(req,res)=>{
    let UserId = req.user.userId;

    let {RoleId, UserName, email, password, PhoneNumber} = req.body

    console.log("request body",req.body)
    try{
        const data = {
            RoleId, UserName, email, password, PhoneNumber
        }
        const usr=await UserModel.update(data,{where:{UserId: UserId}})
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

export const updatePassword=async(req,res)=>{
    let UserId = req.user.userId;
    let {oldPassword, newPassword } = req.body

    const user = await UserModel.findOne({ where: { UserId: UserId } });
    const isMatch = await bcrypt.compare(oldPassword, user.password)

    let password = newPassword
    if(isMatch){
        password = await bcrypt.hash(password, 10)// password encryption 
    }
    else{
        return res.status(402).json({message:"Incorrect Old password!"})
    }
    try{
        const usr=await UserModel.update(
            { password: password }, // Only update the password field
            { where: { UserId } } // Make sure you're targeting the correct user
          );
        console.log("User id result",usr);
        if(usr[0]==0){
            return res.status(404).json({message:"Not found!"})
        }
        return res.status(200).json({message:"Password Successfully Updated"})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({"error":"Internal server error"})
    }
}



//used in edit user
export const updateUserRights = async (req, res) => {
    let { UserId, UserName, Role } = req.body;
    try {

        const role = await RoleModel.findOne({ where: { RoleName: Role } })

        const exsistingUsr = await UserModel.findOne({ where: { UserId: UserId } })

        const data = {
            UserName: UserName,
            RoleId: role.RoleId,
            email: exsistingUsr.email,
            password: exsistingUsr.password,
            PhoneNumber: exsistingUsr.PhoneNumber
        }
        console.log("User id to get", UserId);

        console.log("data for update", data)
        const usr = await UserModel.update(data, { where: { UserId: UserId } })
        console.log("User id result", usr);
        if (usr[0] == 0) {
            return res.status(404).json({ message: "Not found!" })
        }
        if(Role=="admin"){
            const email=exsistingUsr.email;
            sgMail.setApiKey(process.env.API_KEY);

            const emailBody = await renderEmailTemplateUpdateUser({ UserName });
        
            const message = {
                to: email,
                from: 'ayeshaMubasher28@gmail.com',
                subject: 'EasyPark: You Have Been Granted Admin Rights',
                text: 'You have been granted Admin Rights!',
                html: emailBody,
            };
        
            sgMail
                .send(message)
                .then((response) => console.log('Admin rights email sent'))
                .catch((error) => console.log(error.message));
        }
        return res.status(200).json({ message: "updated successfully" })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}
const renderEmailTemplateUpdateUser = async (data) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const templatePath = path.join(__dirname, 'views', 'adminRights.ejs');
    const emailBody = await ejs.renderFile(templatePath, data);

    return emailBody;
};

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
