import db, { sequelize } from "../models/index";
require("dotenv").config();
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};
let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        // resolve({
        //   data,
        // });
        // return;
        let token = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
        await emailService.sendSimpleEmail({
          receiverEmail: data.email,
          patientName: data.fullName,
          time: data.timeString,
          doctorName: data.doctorName,
          language: data.language,
          redirectLink: buildUrlEmail(data.doctorId, token),
        });

        //upsert patient
        let user = await db.User.findOrCreate({
          where: { email: data.email },
          //nếu tìm không có thì vào defaults để tạo mới
          defaults: {
            email: data.email,
            roleId: "R3",
          },
          // raw: false, //kiếu object sequelize
          // raw: true, ko cần nữa vì mặc định đã cấu hình sequelize raw =true
        });

        // console.log(">>>> Hoi dan it check user: ", user[0]);
        //create a booking record
        if (user && user[0]) {
          //nếu tìm thấy user đã tồn tại rồi thì nó không làm gì cả
          await db.Booking.findOrCreate({
            where: { patientId: user[0].id },
            /**
             *  kiểm tra Id user có tồn tại không mới tạo lịch hẹn, nếu vậy họ chỉ tạo dc 1 lịch hẹn duy nhất ,
             *  lần sau họ quay lại tạo họ vẫn dùng email đấy thì họ không thể tạo thêm được lịch hẹn mới
             */
            //thay vì check id thì có thể check date hoặc check status
            // where: { date: data.date },
            defaults: {
              statusId: "S1",
              doctorId: data.doctorId, //lấy từ trong cái data truyền lên doctorId
              patientId: user[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token,
            },
          });
        }

        resolve({
          errCode: 0,
          errMessage: "Save infor patient succeed!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S1",
          },
          raw: false, //phải để raw: false, trả ra 1 object sequelize mới dùng được hàm update (save)
        });
        //if vì chắc chắn lấy ra 1 object appointment, còn không tìm thấy là undefine ko vào đc hàm if
        if (appointment) {
          appointment.statusId = "S2";
          await appointment.save();

          resolve({
            errCode: 0,
            errMessage: "Update the appointment succeed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMessage: "Appointment has been activated or does not exist",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  postBookAppointment: postBookAppointment,
  postVerifyBookAppointment: postVerifyBookAppointment,
};
