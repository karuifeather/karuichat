const users = [];

// Adds user
const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //  Validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required!',
    };
  }

  if (username === room) {
    return {
      error: 'Username must be different from a room name!',
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: 'Username already taken in the room!',
    };
  }

  // Store user
  const user = { id, room, username };
  users.push(user);

  return { user };
};

// Removes user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Gets user
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

// Gets user in a room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const foundUsers = users.filter((user) => user.room === room);

  return foundUsers;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
