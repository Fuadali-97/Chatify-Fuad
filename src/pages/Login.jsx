import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../services/api'
import { jwtDecode } from 'jwt-decode'

export default function Login() {
  const [f, setF] = useState({ username: '', password: '' })
  const [msg, setMsg] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    
    try {
      const { data } = await login(f)
      
      if (data.user) {
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('userId', data.user.id)
        sessionStorage.setItem('username', data.user.username)
        sessionStorage.setItem('avatar', 'https://i.pravatar.cc/200')
      } else {
        const payload = jwtDecode(data.token)
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('userId', payload?.sub || '')
        sessionStorage.setItem('username', payload?.username || f.username)
        sessionStorage.setItem('avatar', 'https://i.pravatar.cc/200')
      }
      
      location.assign('/chat')
    } catch (err) {
      const m = err?.response?.data?.message || 'Invalid credentials'
      setMsg(m)
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="chatify-header">Chatify</div>
      <div className="form-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z" fill="currentColor"/>
        </svg>
      </div>
      <h2>Logga in</h2>
      <input 
        placeholder="Username" 
        required 
        value={f.username} 
        onChange={e => setF({ ...f, username: e.target.value })}
      />
      <input 
        placeholder="Password" 
        type="password" 
        required 
        value={f.password} 
        onChange={e => setF({ ...f, password: e.target.value })}
      />
      <button type="submit">Logga in</button>
      {msg && <p className="error">{msg}</p>}
      <Link to="/register">Har du inget konto? Registrera dig</Link>
    </form>
  )
}