import userService from "../services/userService";

let handleLogin = async (req, res) => {
  let email = req.body.email;
  //   console.log("your email: " + email); //email undefined
  let password = req.body.password;
  //   if(email === '' || email === null || email === 'undefined')
  if (!email || !password) {
    return res.status(500).json({
      errCode: 1, //dinh danh 1 cai errCode tra ve 1l
      message: "Missing inputs parameter!",
    });
  }

  let userData = await userService.handleUserLogin(email, password);
  //check email exist
  //compare password
  // return userInfor
  // access_token: JWT json web token
  return res.status(200).json({
    errCode: userData.errCode,
    message: userData.errMessage,
    user: userData.user ? userData.user : {}, //nếu mà ko có biến user thì trả về giá trị object rỗng, có thì in ra
    // userData,
    // errCode: 0,
    // message: "hello world",
    // yourEmail: email,
    // test: "test",
  });
};

let handleGetAllUsers = async (req, res) => {
  let id = req.query.id; //ALL, id

  // console.log(users);
  if (!id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters",
      users: [],
    });
  }

  let users = await userService.getAllUsers(id);
  return res.status(200).json({
    errCode: 0,
    errMessage: "Oke",
    users,
  });
};

let handleCreateNewUser = async (req, res) => {
  let message = await userService.createNewUser(req.body);
  // console.log(message);
  return res.status(200).json(message);
};

let handleDeleteUser = async (req, res) => {
  if (!req.body.id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing required parameters!",
    });
  }
  let message = await userService.deleteUser(req.body.id);
  return res.status(200).json(message);
};

let handleEditUser = async (req, res) => {
  let data = req.body;
  let message = await userService.updateUserData(data);
  return res.status(200).json(message);
};

module.exports = {
  handleLogin: handleLogin,
  handleGetAllUsers: handleGetAllUsers,
  handleCreateNewUser: handleCreateNewUser,
  handleEditUser: handleEditUser,
  handleDeleteUser: handleDeleteUser,
};
