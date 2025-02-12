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
            }
        })
        const Roles = role.map((role) => role.RoleName)
        console.log(Roles);
        return res.status(200).json(Roles)
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ "error": "Internal server error" })
    }
}
