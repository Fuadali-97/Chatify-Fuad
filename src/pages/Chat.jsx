import { useEffect, useState, useRef } from 'react'
import DOMPurify from 'dompurify'
import { getMessages, createMessage, deleteMessage } from '../services/api'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const userId = localStorage.getItem('userId')
  const username = localStorage.getItem('username') || 'Guest'
  const avatar = localStorage.getItem('avatar') || 'https://i.pravatar.cc/200'
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
    const clean = DOMPurify.sanitize(text)
    if (!clean.trim()) return
    
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
      <div className="chat-list" ref={chatListRef}>
        {messages.map(m => {
          const mine = String(m.userId) === String(userId)
          return (
            <div key={m.id} className={`msg ${mine ? 'mine' : 'other'}`}>
              <img 
                src={mine ? avatar : 'https://i.pravatar.cc/200?u=bot'} 
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