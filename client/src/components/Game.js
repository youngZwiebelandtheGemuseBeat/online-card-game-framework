import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'
import queryString from 'query-string'
import Spinner from './Spinner'
import useSound from 'use-sound'

import bgMusic from '../assets/sounds/game-bg-music.mp3'
import logo from '../assets/logo.png'

let socket
const ENDPOINT = 'http://localhost:5000'

const Game = (props) => {
    const data = queryString.parse(props.location.search)

    //initialize socket state
    const [room, setRoom] = useState(data.roomCode)
    const [roomFull, setRoomFull] = useState(false)
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])

    const [isChatBoxHidden, setChatBoxHidden] = useState(true)
    const [isSoundMuted, setSoundMuted] = useState(false)
    const [isMusicMuted, setMusicMuted] = useState(true)

    const [playBBgMusic, { pause }] = useSound(bgMusic, { loop: true })

    useEffect(() => {
        const connectionOptions =  {
            "forceNew" : true,
            "reconnectionAttempts": "Infinity", 
            "timeout" : 10000,                  
            "transports" : ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions)

        socket.emit('join', {room: room}, (error) => {
            if(error)
                setRoomFull(true)
        })

        //cleanup on component unmount
        return function cleanup() {
            socket.emit('disconnect')
            //shut down connection instance
            socket.off()
        }
    }, [])

    useEffect(() => {
        socket.on("roomData", ({ users }) => {
            setUsers(users)
        })

        socket.on('currentUserData', ({ name }) => {
            setCurrentUser(name)
        })

        socket.on('message', message => {
            setMessages(messages => [ ...messages, message ])

            const chatBody = document.querySelector('.chat-body')
            chatBody.scrollTop = chatBody.scrollHeight
        })
    }, [])

    const toggleChatBox = () => {
        const chatBody = document.querySelector('.chat-body')
        if(isChatBoxHidden) {
            chatBody.style.display = 'block'
            setChatBoxHidden(false)
        }
        else {
            chatBody.style.display = 'none'
            setChatBoxHidden(true)
        }
    }

    const sendMessage= (event) => {
        event.preventDefault()
        if(message) {
            socket.emit('sendMessage', { message: message }, () => {
                setMessage('')
            })
        }
    }
    
    return (
        <div className='Game backgroundColorWood'>
            {(!roomFull) ? <>

                <div className='topInfo'>
                    <img src={logo} alt="Game Logo" />
                    <h1>Game Code: {room}</h1>
                    <span>
                        <button className='game-button green' onClick={() => setSoundMuted(!isSoundMuted)}>{isSoundMuted ? <span className="material-icons">volume_off</span> : <span className="material-icons">volume_up</span>}</button>
                        <button className='game-button green' onClick={() => {
                            if(isMusicMuted)
                                playBBgMusic()
                            else
                                pause()
                            setMusicMuted(!isMusicMuted)
                        }}>{isMusicMuted ? <span className="material-icons">music_off</span> : <span className="material-icons">music_note</span>}</button>
                    </span>
                </div>

                {/* PLAYER LEFT MESSAGES */}
                {users.length===1 && currentUser === 'Player 2' && <h1 className='topInfoText'>Player 1 has left the game.</h1> }
                {users.length===1 && currentUser === 'Player 1' && <h1 className='topInfoText'>Waiting for Player 2 to join the game.</h1> }

                {users.length===2 && <>
                    <div className="chatBoxWrapper">
                        <div className={`chat-box ${currentUser === 'Player 1' ? 'chat-box-player1' : 'chat-box-player2'}`}>
                            <div className="chat-head">
                                <h2>Chat Box</h2>
                                {!isChatBoxHidden ?
                                <span onClick={toggleChatBox} className="material-icons">keyboard_arrow_down</span> :
                                <span onClick={toggleChatBox} className="material-icons">keyboard_arrow_up</span>}
                            </div>
                            <div className="chat-body">
                                <div className="msg-insert">
                                    {messages.map((msg, i) => {
                                        if(msg.user === (currentUser === 'Player 1' ? 'Player 2' : 'Player 1'))
                                            return <div key={i} className="msg-receive">{msg.text}</div>
                                        if(msg.user === currentUser)
                                            return <div key={i} className="msg-send">{msg.text}</div>
                                    })}
                                </div>
                                <div className="chat-text">
                                    <input type='text' placeholder='Type a message...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </> }
            </> : <h1>Room full</h1> }

            <br />
            <a href='/'><button className="game-button red">QUIT</button></a>
        </div>
    )
}

// export as default export of the module
export default Game
