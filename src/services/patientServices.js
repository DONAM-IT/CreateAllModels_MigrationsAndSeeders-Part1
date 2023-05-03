import db, { sequelize } from "../models/index";
require("dotenv").config();
import emailService from "./emailService";

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

        await emailService.sendSimpleEmail({
          receiverEmail: data.email,
          patientName: data.fullName,
          time: data.timeString,
          doctorName: data.doctorName,
          language: data.language,
          redirectLink: "https://www.youtube.com/watch?v=oDyCAgjQ7gY",
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

module.exports = {
  postBookAppointment: postBookAppointment,
};
