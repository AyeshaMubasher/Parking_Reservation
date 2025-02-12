import { DataTypes } from "sequelize";

export const createRolesModel=async(sequelize)=>{
    const Role=sequelize.define('Role',{
      RoleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      RoleName:{
        type:DataTypes.STRING,
        allowNull: false,
        unique:true
    }
    })
  
    // After the table is created, insert default roles
    Role.afterSync(async () => {
      const roles = ['super admin', 'admin', 'user'];
  
      for (let role of roles) {
        await Role.findOrCreate({
          where: { RoleName: role }
        });
      }
    });
  
    return Role;
  }