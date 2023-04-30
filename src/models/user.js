"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      /**
       * `belongsTo`: Phương thức này được sử dụng để thiết lập quan hệ Ngược lại (Many-to-One) giữa hai bảng. Ví dụ: Một Comment chỉ thuộc về một User. Đây là quan hệ Ngược lại vì một User có thể có nhiều Comment (một người dùng có thể có nhiều bình luận,
       * nhưng mỗi bình luận chỉ thuộc về một người dùng duy nhất).
       */
      //( belongsTo thiết lập quan hệ Ngược lại (Many-to-One) giữa hai bảng.)
      // Một User chỉ thuộc về một Allcode
      User.belongsTo(models.Allcode, {
        foreignKey: "positionId", //positionId là cột trong bảng table User (foreignKey năm trong bảng User)
        targetKey: "keyMap", //keyMap là cột bên cái table Allcode
        as: "positionData",
      });
      User.belongsTo(models.Allcode, {
        foreignKey: "gender",
        targetKey: "keyMap",
        as: "genderData",
      });
      User.hasOne(models.Markdown, { foreignKey: "doctorId" });
      /**  được sử dụng để thiết lập một mối quan hệ `One-to-One` 
       * Bảng `User` có quan hệ một-ổn nhiệm với bảng `Doctor_infor`, qua khóa ngoại `doctorId` 
       *
       * 
       * 1 - N                                                                 bên bảng `Doctor_infor`.
Một bác sĩ có thể có nhiều thông tin liên quan đến mình trong bảng `Doctor_infor`, 
nhưng mỗi thông tin này chỉ "thuộc về" một bác sĩ duy nhất trong bảng `User`.
1 - 1
Nếu mỗi bản ghi trong bảng `user` chỉ có thể liên kết với tối đa một bản ghi trong bảng `doctor_infor`, thì việc sử dụng phương thức `hasOne` là đúng.       
*/

      User.hasOne(models.Doctor_infor, { foreignKey: "doctorId" });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      address: DataTypes.STRING,
      phonenumber: DataTypes.STRING,
      gender: DataTypes.STRING,
      image: DataTypes.STRING,
      roleId: DataTypes.STRING,
      positionId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
