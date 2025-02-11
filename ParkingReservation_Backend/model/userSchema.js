
import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt'

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
