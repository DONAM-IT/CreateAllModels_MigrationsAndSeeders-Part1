"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Allcode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // define association here
    //relationship mối quan hệ (associate mối liên kết)
    static associate(models) {
      /**
       * Mối quan hệ 1-nhiều (One-to-Many):
       * Một Allcode (1 Bảng A) có thể có nhiều User(mỗi user là một bản ghi trong bảng B),
       * nhưng mỗi user chỉ tương ứng với một Allcode (là một bản ghi trong bảng A).
       */
      Allcode.hasMany(models.User, {
        foreignKey: "positionId",
        as: "positionData",
      });
      Allcode.hasMany(models.User, { foreignKey: "gender", as: "genderData" });
      Allcode.hasMany(models.Schedule, {
        foreignKey: "timeType",
        as: "timeTypeData",
      });

      //table Doctor_infor map với bảng table Allcode thông qua trường key Doctor_infor priceId
      // đoạn code dưới nó sẽ tự động hiểu là cái trường priceId nó sẽ map với bảng AllCode
      Allcode.hasMany(models.Doctor_infor, {
        foreignKey: "priceId",
        as: "priceTypeData",
      });
      Allcode.hasMany(models.Doctor_infor, {
        foreignKey: "provinceId",
        as: "provinceTypeData",
      });
      Allcode.hasMany(models.Doctor_infor, {
        foreignKey: "paymentId",
        as: "paymentTypeData",
      });
    }
  }

  Allcode.init(
    {
      keyMap: DataTypes.STRING,
      type: DataTypes.STRING,
      valueEn: DataTypes.STRING,
      valueVi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Allcode",
    }
  );
  return Allcode;
};
