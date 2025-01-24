import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from "sequelize";
import { createUserModel,createSlotModel,createBookingModel } from "../model/userSchema.js";

const sequelize = new Sequelize(process.env.DATABASE, process.env.USER_NAME, process.env.PASSWORD, {
    host: process.env.Host,
    dialect: 'postgres'
  });

  let UserModel=null;
  let SlotModel=null;
  let BookingModel=null;
  const connection=async()=>{
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        UserModel= await createUserModel(sequelize)
        await sequelize.sync();
        SlotModel= await createSlotModel(sequelize)
        await sequelize.sync();
        BookingModel= await createBookingModel(sequelize)
        await sequelize.sync();

        console.log("UserModel",UserModel);

    console.log('Database synchronized');

    // Optionally, you can add associations here if needed
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
    BookingModel
  }