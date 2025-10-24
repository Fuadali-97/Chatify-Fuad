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
      const { data } = await getMessages()
      setMessages(data || [])
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
    e.preventDefault()
    if (!text.trim()) return
    
  
    const clean = text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
    
    await createMessage({ text: clean })
    setText('')
    await load()
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
          const mine = String(m.userId) === String(userId)
          return (
            <div key={m.id} className={`msg ${mine ? 'mine' : 'other'}`}>
              <img 
                src={mine ? (avatar || 'https://i.pravatar.cc/200') : 'https://i.pravatar.cc/200?u=bot'} 
                alt="avatar" 
                className="msg-avatar" 
              />
              <div className="bubble" dangerouslySetInnerHTML={{ __html: m.text }} />
              {mine && <button className="delete" onClick={() => remove(m.id)}>🗑</button>}
            </div>
          )
        })}
      </div>
      
      <form className="chat-input" onSubmit={send}>
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Skriv ett meddelande..." 
        />
        <button type="submit">Skicka</button>
      </form>
    </div>
  )
}