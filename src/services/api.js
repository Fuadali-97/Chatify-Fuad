import axios from 'axios'

const api = axios.create({
  baseURL: 'https://chatify-api.up.railway.app',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  }
  return config
})

export async function getCSRF() {
  const res = await api.patch('/csrf')
  const csrfToken = res?.data?.csrfToken
  if (csrfToken) {
    localStorage.setItem('csrfToken', csrfToken)
  }
  return res
}

export async function register({ username, email, password }) {
  await getCSRF()
  const csrfToken = localStorage.getItem('csrfToken')
  return api.post('/auth/register', { username, email, password, csrfToken })
}

export async function login({ username, password }) {
  await getCSRF()
  const csrfToken = localStorage.getItem('csrfToken')
  return api.post('/auth/token', { username, password, csrfToken })
}

export async function getMessages() {
  const res = await api.get('/messages')
  if (res.data?.messages) {
    return { data: res.data.messages }
  }
  return res
}

export async function createMessage({ text }) {
  return api.post('/messages', { text })
}

export async function createBotMessage({ text }) {
  const botApi = axios.create({
    baseURL: 'https://chatify-api.up.railway.app',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  })
  
  try {
    await getCSRF()
    const csrfToken = localStorage.getItem('csrfToken')
    const loginRes = await botApi.post('/auth/token', { 
      username: 'AutoBot', 
      password: 'AutoBot123!',
      csrfToken 
    })
    
    const botToken = loginRes?.data?.token
    if (botToken) {
      botApi.defaults.headers.common['Authorization'] = `Bearer ${botToken}`
      return botApi.post('/messages', { text })
    }
  } catch (err) {
    console.error('AutoBot login failed, trying to register...', err)
    try {
      await getCSRF()
      const csrfToken = localStorage.getItem('csrfToken')
      await botApi.post('/auth/register', {
        username: 'AutoBot',
        email: 'autobot@chatify.com',
        password: 'AutoBot123!',
        csrfToken
      })
      
      const loginRes = await botApi.post('/auth/token', {
        username: 'AutoBot',
        password: 'AutoBot123!',
        csrfToken
      })
      
      const botToken = loginRes?.data?.token
      if (botToken) {
        botApi.defaults.headers.common['Authorization'] = `Bearer ${botToken}`
        return botApi.post('/messages', { text })
      }
    } catch (registerErr) {
      console.error('AutoBot registration/login failed:', registerErr)
    }
  }
  
  throw new Error('Failed to send bot message')
}

export async function deleteMessage(id) {
  return api.delete(`/messages/${id}`)
}