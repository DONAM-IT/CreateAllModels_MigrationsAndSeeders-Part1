"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 1 thằng Schedule nó sẽ thuộc về 1 thằng Allcode
      Schedule.belongsTo(models.Allcode, {
        foreignKey: "timeType", //timeType là cột bên cái table Schedule
        targetKey: "keyMap", //keyMap là cột bên cái table Allcode
        //dùng 2 cái trường timeType và keyMap để squelize biết khi muốn lấy trường timeType này nó sẽ map bên cái trường keyMap bên cái bảng Allcode và sequelize sẽ trả data bên bảng data bên AllCode dưới dạng timeTypeData
        as: "timeTypeData",
      });
    }
  }
  Schedule.init(
    {
      currentNumber: DataTypes.INTEGER,
      maxNumber: DataTypes.INTEGER,
      date: DataTypes.STRING,
      timeType: DataTypes.STRING,
      doctorId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Schedule",
    }
  );
  return Schedule;
};
