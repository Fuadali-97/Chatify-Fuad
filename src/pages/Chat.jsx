import { useEffect, useState, useRef } from 'react'
import DOMPurify from 'dompurify'
import { getMessages, createMessage, deleteMessage } from '../services/api'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const userId = sessionStorage.getItem('userId')
  const username = sessionStorage.getItem('username') || 'Guest'
  const avatar = sessionStorage.getItem('avatar') || 'https://i.pravatar.cc/200'
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
      const newMsg = await createMessage({ message: clean })
      setMessages(prev => [...prev, newMsg])
      setText('')

    } catch (err) {
      console.error('Kunde inte skicka meddelande', err)
      alert('Kunde inte skicka meddelande. Testa logga ut och in igen.')
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
        <img src={avatar} alt="avatar" className="chat-avatar" />
        <span className="chat-username">{username}</span>
      </header>
      <div className="chat-list" ref={chatListRef}>
        {messages.map(m => {
          const msgUserId = String(m.userId || m.user?.id || '')
          const msgUsername = (m.username || m.user?.username || '').toLowerCase()
          const currentUserId = String(userId || '')
          const isAutoBot = msgUsername === 'autobot' || msgUserId === 'AutoBot'
          const isMine = !isAutoBot && msgUserId === currentUserId && currentUserId !== ''
          
          return (
            <div key={m.id} className={`msg ${isMine ? 'mine' : ''}`}>
              <img 
                src={isMine ? (avatar || 'https://i.pravatar.cc/200') : (m.avatar || 'https://i.pravatar.cc/200?img=12')} 
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