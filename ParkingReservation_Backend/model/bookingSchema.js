import { DataTypes } from "sequelize";

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
            allowNull: false,
            validate: {
              is: {
                args: [/^[A-Z0-9]{1,15}$/],
                msg: "Vehicle number should be between 1 to 15 characters and contain only uppercase letters and numbers (e.g., ABC123)."
              },
              notEmpty: {
                msg: "Vehicle number is required."
              }
            }
          },
          start_time: { //stores both date and time
            type: DataTypes.DATE,
            allowNull: false,
          },
          end_time: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          totalPrice: {  
            type: DataTypes.INTEGER,
            allowNull: false, 
          },
          status: {
            type: DataTypes.STRING,
            defaultValue: 'active',
          },
        }, {
          paranoid: true, // Automatically manages deleted_at field for soft deletes
        }
    )
    return Booking;
}