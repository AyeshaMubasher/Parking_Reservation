
import { DataTypes } from "sequelize";

export const createUserModel=async(sequelize)=>{

    const User=sequelize.define('User' , {
        UserId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
        UserName:{
            type:DataTypes.STRING,
            allowNull: false
        },
        email:{
            type:DataTypes.STRING,
            allowNull: false,
            isLowercase:true,
            unique:true
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                notNull: {
                  msg: "Password is required"
                },
                notEmpty: {
                  msg: "Password is required"
                }
              },
            unique:true
        },
        PhoneNumber:{
            type:DataTypes.STRING,
            allowNull: true
        }
    })

    return User;
}

export const createSlotModel=async(sequelize)=>{

    const Slot=sequelize.define('Slot' , {
        SlotId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
        SlotName:{
            type:DataTypes.STRING,
            allowNull: false
        },
        is_available: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    })

    return Slot;
}

export const createBookingModel=async(sequelize)=>{

    const Booking=sequelize.define('Booking',{
        BookingId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          UserId: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          SlotId: {
            type: DataTypes.INTEGER,
            allowNull: false
          },
          vehicleNumber:{
            type:DataTypes.STRING,
            allowNull: false
          },
          start_time: { //stores both date and time
            type: DataTypes.DATE,
            allowNull: false,
          },
          end_time: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          status: {
            type: DataTypes.STRING,
            defaultValue: 'active',
          },
    })
    return Booking;
}
