import db from "../models/index";
import bcrypt, { hash } from "bcryptjs";
require("dotenv").config();

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
          image: data.avatar, //thuộc tính là image, còn cái trường truyền lên bên phía react là avatar
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
      if (!data.id || !data.roleId || !data.positionId || !data.gender) {
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
        user.roleId = data.roleId;
        user.positionId = data.positionId;
        user.gender = data.gender;
        // user.phonenumber = data.phoneNumber; //data.phoneNumber là dữ liệu ép kiểu bên react đã đặt
        user.phonenumber = data.phonenumber;
        if (data.avatar) {
          user.image = data.avatar;
        }

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
let getPostLimitService = (offset) => {
  return new Promise(async (resolve, reject) => {
    try {
      let res = {};
      let response = await db.User.findAndCountAll({
        offset: offset * +process.env.LIMIT_USER || 0,
        limit: +process.env.LIMIT_USER,
      });
      res.errCode = 0;
      res.data = response;
      resolve(res);
    } catch (e) {
      reject(e);
    }
  });
};
let getUsersPaginationService = ({
  page,
  limit,
  order,
  firstName,
  available,
  ...query
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      let queries = {};
      // let queries = {};
      //offset là vị trí muốn lấy, offset = 8 là bỏ qua 8 cái đầu tiên
      let offset = !page || +page <= 1 ? 0 : +page - 1;
      let fLimit = +limit || +process.env.LIMIT_USER; // số lượng lấy trong 1 dòng
      queries.offset = offset * limit;
      queries.limit = fLimit;
      if (order) queries.order = [order];
      if (firstName) query.firstName = { [Op.substring]: firstName };

      //hàm để phân trang findAndCountAll
      let response = await db.User.findAndCountAll({
        where: query,
        offset: +process.env.LIMIT_USER * offset || 0,
        ...queries,
      });

      resolve({
        err: response ? 0 : 1,
        mes: response ? "Got" : "Cannot found users",
        userData: response,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getDoctorsService = ({ page, limit, order, name, ...query }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const queries = { raw: true, nest: true };
      const offsetStep = !page || +page < 1 ? 0 : +page - 1;
      const fLimit = +limit || +process.env.LIMIT_BOOK;
      queries.offset = offsetStep * fLimit;
      queries.limit = fLimit;
      if (order) queries.order = [order];
      if (name) query.lastName = { [Op.substring]: name };
      // if (available) query.available = { [Op.between]: available };
      const response = await db.User.findAndCountAll({
        where: query,
        ...queries,
      });
      resolve({
        err: response ? 0 : 1, //response[1] là true trả về mã code là 0, response[0] là false trả về mã code là 1 tức là response[1] là tạo thành công thì trả về 0, ko tạo thì trả về 1, 0 1 trong respone là phần tử đầu tiên là data
        mes: response ? "Got" : "Cannot found books",
        doctorData: response,
      });
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
  getUsersPaginationService: getUsersPaginationService,
  getPostLimitService: getPostLimitService,
  getDoctorsService: getDoctorsService,
};
