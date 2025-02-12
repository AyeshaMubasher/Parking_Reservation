
import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt'

export const createUserModel=async(sequelize, Role)=>{

    const User=sequelize.define('User' , {
        UserId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          RoleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 3
          },
        UserName:{
            type:DataTypes.STRING,
            allowNull: false
        },
        email:{
            type:DataTypes.STRING,
            allowNull: false,
            isLowercase:true,
            unique:true,
            validate: {
              isEmail: {
                msg: "Please provide a valid email address"
              },
              notEmpty: {
                msg: "Email is required"
              }
            }
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
            allowNull: true,
            validate: {
              // Regular expression to validate phone number format
              is: {
                args: [/^\+?\d{10,15}$/], // Example: Optional country code + 10-digit phone number
                msg: "Please provide a valid phone number (e.g., +1234567890 or 1234567890)"
              }
            }
        }
        
    })

    // After syncing the models, create a super admin user
  User.afterSync(async () => {
    const superAdminRole = await Role.findOne({ where: { RoleName: 'super admin' } });
    if (!superAdminRole) {
      console.log("Super admin role not found");
      return;
    }
    const superAdminEmail = 'ayeshajohri28@gmail.com';
    const superAdminPassword = 'admin'; // Replace this with a secure password

    // Hash password for super admin
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    await User.findOrCreate({
      where: { email: superAdminEmail },
      defaults: {
        UserName: 'Super Admin',
        email: superAdminEmail,
        password: hashedPassword,
        RoleId: superAdminRole.RoleId
      }
    });
  });


    return User;
}


