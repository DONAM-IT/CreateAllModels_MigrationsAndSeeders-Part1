import db from "../models/index";
import bcrypt, { hash } from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
  return new Promise(async (resove, reject) => {
    try {
      var hashPassword = await bcrypt.hashSync(password, salt);
      resove(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        //user already exist

        let user = await db.User.findOne({
          attributes: ["email", "roleId", "password", "firstName", "lastName"], // cách lấy 1 vài trường mà mình muốn
          where: { email: email },
          raw: true, // nó sẽ trả biến user thành 1 object
        });
        if (user) {
          //compare password
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            userData.errCode = 0;
            userData.errMessage = "Ok";
            // console.log(user);
            delete user.password;
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Wrong password";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = `User's not found`;
        }
      } else {
        //return error
        userData.errCode = 1; //đặt truyền giá trị cho object userData, đặt tên là errCode
        //biến userData đã định nghĩa biến errCode
        userData.errMessage = `Your's Email isn't exist in your system. Plz try other email!`;
      }

      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
        });
      }
      //userId && check bo dc truong hop undefined
      if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ["password"],
          },
        });
      }

      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check email is exist ????
      let check = await checkUserEmail(data.email);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: "Your email is already in used, Plz try anothor email!",
        });
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({
          // Tên cột table User: data.dữ liệu bên Fontend gửi lên, lưu ý backend và fontend phải trùng nhau
          email: data.email,
          password: hashPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phonenumber: data.phoneNumber, //DATA. LÀ DỮ LIỆU BÊN REACT GỬI LÊN PHẢI TRÙNG
          gender: data.gender,
          roleId: data.roleId,
          positionId: data.positionId,
        });

        resolve({
          errCode: 0,
          message: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    let foundUser = await db.User.findOne({
      where: { id: userId },
    });
    if (!foundUser) {
      resolve({
        errCode: 2,
        errMessage: `The user isn't exist`,
      });
    }
    //hàm sẽ bị lỗi vì dữ liệu lấy data từ phía db lên nodejs, lúc này ta đang ở trên nodejs, vì đã ép kiểu foundUser thành obj raw: true trong file config
    // nên object ko theo form chuẩn của sequelize (nói cách khác sequelize chỉ hiểu nó khi người gọi là là instance) tức là 1 class của sequelize, nên gọi hàm destroy sẽ bị lỗi
    // if (foundUser) {
    //   await foundUser.destroy();
    // }
    //dùng cách này kết nối db sau đó xóa dưới db, sequelize thao tác dưới db ko liên quan nodejs
    await db.User.destroy({
      where: { id: userId },
    });

    resolve({
      errCode: 0,
      errMessage: `The user is deleted`,
    });
  });
};

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 2,
          errMessage: "Missing required parameters",
        });
      }
      let user = await db.User.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;

        await user.save();

        resolve({
          errCode: 0,
          message: "Update the user succeeds",
        });
      } else {
        resolve({
          errCode: 1,
          message: `User's not found!`,
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllCodeService = (typeInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInput) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameters !",
        });
      } else {
        let res = {};
        let allcode = await db.Allcode.findAll({
          where: { type: typeInput },
        });
        res.errCode = 0;
        res.data = allcode;
        resolve(res);
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  deleteUser: deleteUser,
  updateUserData: updateUserData,
  getAllCodeService: getAllCodeService,
};
