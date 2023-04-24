import db from "../models/index";
require("dotenv").config();
import _, { reject } from "lodash";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
  //return new Promise đảm bảo rằng code bạn lúc nào cũng trả ra kết quả
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"],
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"],
          },
        ],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: users,
      });
    } catch (error) {
      reject(error);
    }
  });
};

let getAllDoctors = () => {
  //Promise luôn trả về dữ liệu
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password", "image"],
        },
      });
      //resolve trả về 1 object, trong biến object có 1 biến là data chứa tất cả thằng bác sĩ và errCode = 0
      resolve({
        errCode: 0,
        data: doctors,
      });
    } catch (error) {
      reject(error);
    }
  });
};
let saveDetailInforDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !inputData.doctorId ||
        !inputData.contentHTML ||
        !inputData.contentMarkdown ||
        !inputData.action
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId,
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false, //doctorMarkdown để nó hiểu là 1 sequelize object
          });
          //có nhiều người cùng thao tác đến database, lúc nhìn database có nhưng có thằng khác xóa rồi,
          //thì trường hợp này trả ra null, check if để app ko lỗi
          //nếu tìm thấy doctorMarkdown
          console.log(doctorMarkdown);
          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = inputData.contentHTML;
            doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
            doctorMarkdown.description = inputData.description;
            // doctorMarkdown.updateAt = new Date(); không cần vì sequelize nó tự cập nhật thời gian
            await doctorMarkdown.save(); //hàm save phải set raw: false
          }
        }
        resolve({
          errCode: 0,
          errMessage: "Save infor doctor succeed!",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!",
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId,
          },
          attributes: {
            // exclude: ["password", "image"],
            exclude: ["password"],
          },
          //Muốn dùng include phải định nghĩa các mối quan hệ cho nó
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"],
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"], //các trường cần lấy
            },
          ],
          //raw: true thì nó hiểu là 1 sequelize object chứ nó không phải là 1 thằng javascript object thành ra có sự khác biệt
          raw: false, //raw: false sẽ covert sang kiểu object
          nest: true, //nó sẽ gom nhóm lại
        });
        //convert ảnh qua base64
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }
        // console.log(data);
        //nếu không tìm thấy data set data = 1 object rỗng
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

let bulkCreateSchedule = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log("hoi dan it check data: ", data);
      if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter !",
        });
      } else {
        let schedule = data.arrSchedule;
        // console.log("schedule:before ", schedule);
        if (schedule && schedule.length > 0) {
          schedule = schedule.map((item) => {
            item.maxNumber = MAX_NUMBER_SCHEDULE;
            return item;
          });
        }
        // console.log("hoi dan it channel: data send: ", data);
        // console.log("hoi dan it channel: data send: ", typeof data);
        // console.log("hoi dan it channel: data send: ", data[0]);
        console.log("hoi dan it channel: data send:after ", schedule); //lấy biến schedule từ trong cục data gửi lên
        console.log("hoi dan it channel: data send: ", typeof schedule);

        //get all existing data
        let existing = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: data.formatedDate },
          attributes: ["timeType", "date", "doctorId", "maxNumber"],
          raw: true,
        });

        //convert date
        if (existing && existing.length > 0) {
          existing = existing.map((item) => {
            item.date = new Date(item.date).getTime();
            return item;
          });
        }

        //compare diffrent
        let toCreate = _.differenceWith(schedule, existing, (a, b) => {
          return a.timeType === b.timeType && a.date === b.date;
        });

        //create data
        if (toCreate && toCreate.length > 0) {
          await db.Schedule.bulkCreate(toCreate);
        }

        // resolve(""); //trả về 1 mảng rỗng để test
        resolve({
          errCode: 0,
          errMessage: "OKE",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter",
        });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date,
          },
        });

        if (!dataSchedule) {
          dataSchedule = [];
        }

        resolve({
          errCode: 0,
          data: dataSchedule, //nếu như thành công thì nó trả ra 1 cái object, nó có cái trường data sẽ lưu lại kế hoạch của thằng bác sĩ
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome, //key và value
  getAllDoctors: getAllDoctors,
  saveDetailInforDoctor: saveDetailInforDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
};
