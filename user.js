const c_users = [];

// joins the user to the specific chatroom
function join_User(id, username, room, screenDimension) {
  let p_user = { id, username, room, screenDimension };
  if (c_users.length > 0) {
    if (c_users[0].name === "Player1") {
      p_user.name = "Player2";
    } else {
      p_user.name = "Player1";
    }
    c_users[1] = p_user;
  } else {
    p_user.name = "Player1";
    c_users[0] = p_user;
  }
  console.log(c_users, "users");

  return p_user;
}

console.log("user out", c_users);

// Gets a particular user id to return the current user
function get_Current_User(id) {
  return c_users.find((p_user) => p_user.id === id);
}

// called when the user leaves the chat and its user object deleted from array
function user_Disconnect(id) {
  const index = c_users.findIndex((p_user) => p_user.id === id);
  if (index !== -1) {
    return c_users.splice(index, 1)[0];
  }
}

// to get all users
function getAllUsers() {
  return c_users;
}

function getUsersScreenRatio() {
  if (c_users.length > 1) {
    const ratio = {
      width:
        c_users[0].screenDimension.width / c_users[1].screenDimension.width,
      height:
        c_users[0].screenDimension.height / c_users[1].screenDimension.height,
    };
    return ratio;
  } else {
    return { width: 1, height: 1 };
  }
}

module.exports = {
  join_User,
  get_Current_User,
  user_Disconnect,
  getAllUsers,
  getUsersScreenRatio,
};
