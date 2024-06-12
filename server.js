const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')
const path = require('path')

const PORT = process.env.PORT || 5000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(cors())

io.on('connection', socket => {
    // user joins a room
    socket.on('join', (payload, callback) => {
        let numberOfUsersInRoom = getUsersInRoom(payload.room).length

        const { error, newUser } = addUser({
            id: socket.id,
            name: numberOfUsersInRoom === 0 ? 'Player 1' : 'Player 2',
            room: payload.room
        })

        if (error)
            return callback(error)

        socket.join(newUser.room)

        io.to(newUser.room).emit('roomData', { room: newUser.room, users: getUsersInRoom(newUser.room) })
        socket.emit('currentUserData', { name: newUser.name })
        callback()
    })

    // handle game state initialization
    socket.on('initGameState', gameState => {
        const user = getUser(socket.id)
        if (user)
            io.to(user.room).emit('initGameState', gameState)
    })

    // update game state
    socket.on('updateGameState', gameState => {
        const user = getUser(socket.id)
        if (user)
            io.to(user.room).emit('updateGameState', gameState)
    })

    // chat
    socket.on('sendMessage', (payload, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', { user: user.name, text: payload.message })
        callback()
    })

    // clean up on disconnection
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user)
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
    })
})

// serve static assets in production
// = single-page application's client-side routing
// .. serves the index.html allowing the client-side js (React) frontend to handle the routing.
if (process.env.NODE_ENV === 'production') 
{
  //set static build folder : > npm run build
  app.use(express.static('client/build'))

  // matches all GET requests that haven’t been handled by previous routes or static file serving middleware
  app.get('*', (req, res) => {
    // res.sendFile() .. sends the index.html file from client/build
    // path.resolve() .. constructs an absolute path to the index.html
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

// server listening
server.listen(PORT, () => 
{
  console.log(`Server running on port ${PORT}`)
})