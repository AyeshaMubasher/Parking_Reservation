import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from "sequelize";
import { createRolesModel,createUserModel,createSlotModel,createBookingModel } from "../model/userSchema.js";

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER_NAME, process.env.PASSWORD, {
    host: process.env.Host,
    dialect: 'postgres'
  });

  let RoleModel=null;
  let UserModel=null;
  let SlotModel=null;
  let BookingModel=null;
  const connection=async()=>{
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        RoleModel= await createRolesModel(sequelize)
        await sequelize.sync();
        UserModel= await createUserModel(sequelize, RoleModel)
        await sequelize.sync();
        SlotModel= await createSlotModel(sequelize)
        await sequelize.sync();
        BookingModel= await createBookingModel(sequelize)
        await sequelize.sync();

        console.log("UserModel",UserModel);

    console.log('Database synchronized');

    RoleModel.hasMany(UserModel, {foreignKey: 'RoleId'})
    UserModel.belongsTo(RoleModel, { foreignKey: 'RoleId' });
    UserModel.hasMany(BookingModel, { foreignKey: 'UserId' });
    SlotModel.hasMany(BookingModel, { foreignKey: 'SlotId' });
    BookingModel.belongsTo(SlotModel, { foreignKey: 'SlotId' });
    


        console.log("Database Synced")
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
  }

  export {
    connection,
    UserModel,
    SlotModel,
    BookingModel,
    RoleModel
  }