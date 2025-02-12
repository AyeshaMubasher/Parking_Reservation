import { DataTypes } from "sequelize";

export const createSlotModel=async(sequelize)=>{

    const Slot=sequelize.define('Slot' , {
        SlotId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
        SlotName:{
            type:DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        price: { //it will store per minute price 
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
    }, {
      paranoid: true, // Automatically manages deleted_at field for soft deletes
    })

    return Slot;
}