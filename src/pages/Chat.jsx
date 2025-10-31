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
    const clean = DOMPurify.sanitize(text || '')
    if (!clean.trim()) return

    try {
      const newMsg = await createMessage({ message: clean })
      const currentUserId = sessionStorage.getItem('userId')
      const currentUsername = sessionStorage.getItem('username')
      const currentAvatar = sessionStorage.getItem('avatar')
      
      const messageWithUser = {
        ...newMsg,
        userId: newMsg.userId || currentUserId,
        username: newMsg.username || currentUsername,
        avatar: newMsg.avatar || currentAvatar
      }
      
      setMessages(prev => [...prev, messageWithUser])
      setText('')

      const botMessage = {
        id: crypto.randomUUID(),
        userId: 'AutoBot',
        username: 'AutoBot',
        avatar: 'https://i.pravatar.cc/200?img=12',
        message: generateBotReply(clean)
      }

      setTimeout(() => setMessages(p => [...p, botMessage]), 800)

    } catch (err) {
      console.error('Kunde inte skicka meddelande', err)
      alert(err?.response?.data?.message || 'Kunde inte skicka. Logga ut/in och prova igen.')
    }
  }

  function generateBotReply(userText) {
    const replies = [
      "Det låter spännande!",
      "Intressant! Berätta mer.",
      "Tack för att du delade det.",
      "Det är en bra poäng!",
      "Intressant perspektiv!",
      "Kan du utveckla det mer?",
    ]
    const random = replies[Math.floor(Math.random() * replies.length)]
    return `AutoBot: ${random}`
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
          const msgUserId = String(m.userId || m.user?.id || '').trim()
          const msgUsername = (m.username || m.user?.username || '').toLowerCase().trim()
          const currentUserId = String(sessionStorage.getItem('userId') || '').trim()
          const currentAvatar = sessionStorage.getItem('avatar') || 'https://i.pravatar.cc/200'
          const isAutoBot = msgUsername === 'autobot' || msgUserId === 'AutoBot' || msgUserId.toLowerCase() === 'autobot'
          const isMine = !isAutoBot && msgUserId === currentUserId && currentUserId !== '' && msgUserId !== ''
          
          if (m.id && currentUserId) {
            console.log('Message:', { msgUserId, currentUserId, isMine, isAutoBot, message: m.message || m.text })
          }
          
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