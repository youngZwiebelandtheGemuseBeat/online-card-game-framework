const users = []
const max_users = 2

// add user to the room unless room is full (max 2 players)
const addUser = ({id, name, room}) => {
  const numberOfUsersInRoom = users.filter(user => user.room === room).length

  if(numberOfUsersInRoom === max_users)
    return { error: 'Room full' }

  const newUser = { id, name, room }
  users.push(newUser)

  return { newUser }
}

const removeUser = id => {
  const removeIndex = users.findIndex(user => user.id === id)

  if(removeIndex!==-1)
    return users.splice(removeIndex, 1)[0]
}

const getUser = id => {
  return users.find(user => user.id === id)
}

const getUsersInRoom = room => {
  return users.filter(user => user.room === room)
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom }