import { useEffect, useState, useRef } from 'react'
import DOMPurify from 'dompurify'
import { getMessages, createMessage, deleteMessage } from '../services/api'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const chatListRef = useRef(null)

  async function load() { 
    try {
      const response = await getMessages()
      let messages = []
      if (response?.data) {
        messages = Array.isArray(response.data) ? response.data : response.data.messages || []
      }
      setMessages(messages)
    } catch (err) {
      console.error('Kunde inte hämta meddelanden', err)
    }
    
    setTimeout(() => {
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight
      }
    }, 200)
  }

  useEffect(() => { load() }, [])

  async function send(e) {
    e?.preventDefault?.()
    if (!text.trim()) return

    const userText = text.trim()
    const clean = DOMPurify.sanitize(userText)

    try {
      await createMessage({ message: clean })

      const myMsg = {
        id: crypto.randomUUID(),
        userId: sessionStorage.getItem('userId'),
        username: sessionStorage.getItem('username'),
        avatar: sessionStorage.getItem('avatar') || 'https://i.pravatar.cc/200',
        message: clean
      }
      setMessages(prev => [...prev, myMsg])
      setText('')

      const botMessage = {
        id: crypto.randomUUID(),
        userId: 'AutoBot',
        username: 'AutoBot',
        avatar: 'https://i.pravatar.cc/200?img=12',
        message: generateBotReply(clean)
      }

      setTimeout(() => setMessages(prev => [...prev, botMessage]), 1000)

    } catch (err) {
      console.error('Kunde inte skicka meddelande', err)
      alert('Det gick inte att skicka meddelandet. Testa logga in igen.')
    }
  }

  function generateBotReply(userText) {
    const replies = [
      "Ja, det låter bra!",
      "Okej, jag förstår.",
      "Det låter rimligt.",
      "Absolut 👍",
      "Haha, jag håller med!",
      "Mm, intressant tanke.",
      "Låter vettigt.",
      "Precis så!",
      "Japp!",
      "Sant faktiskt."
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }

  async function remove(id) { 
    await deleteMessage(id)
    await load() 
  }

  return (
    <div className="chat-wrap">
      <header className="chat-header">
        <img src={sessionStorage.getItem('avatar') || 'https://i.pravatar.cc/200'} alt="avatar" className="chat-avatar" />
        <span className="chat-username">{sessionStorage.getItem('username') || 'Guest'}</span>
      </header>
      <div className="chat-list" ref={chatListRef}>
        {messages.map(m => {
          const currentUserId = sessionStorage.getItem('userId') || ''
          const msgUserId = m.userId || m.user?.id || ''
          const msgUsername = (m.username || m.user?.username || '').toLowerCase()
          const currentAvatar = sessionStorage.getItem('avatar') || 'https://i.pravatar.cc/200'
          
          const isAutoBot = msgUsername === 'autobot' || 
                          String(msgUserId) === 'AutoBot' || 
                          String(msgUserId).toLowerCase() === 'autobot'
          
          const isMine = !isAutoBot && 
                       currentUserId && 
                       msgUserId && 
                       String(msgUserId) === String(currentUserId)
          
          return (
            <div key={m.id} className={`msg ${isMine ? 'mine' : ''}`}>
              <img 
                src={isMine ? currentAvatar : (m.avatar || 'https://i.pravatar.cc/200?img=12')} 
                alt="avatar" 
                className="msg-avatar" 
              />
              <div
                className="bubble"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(m.message || m.text),
                }}
              />
              {isMine && <button className="delete" onClick={() => remove(m.id)}>🗑</button>}
            </div>
          )
        })}
      </div>
      
      <form className="chat-input" onSubmit={send}>
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Skriv ett meddelande..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              send(e)
            }
          }}
        />
        <button type="submit">Skicka</button>
      </form>
    </div>
  )
}