import axios from 'axios'

const isDev = import.meta.env.MODE === 'development'

async function ensureCsrf() {
  try { 
    await getCSRF() 
  } catch { }
}

const getMockUsers = () => {
  const stored = localStorage.getItem('mockUsers')
  if (!stored) {
    const defaultUsers = [{ id: 1, username: 'testuser', email: 'test@example.com', password: 'testpass' }]
    localStorage.setItem('mockUsers', JSON.stringify(defaultUsers))
    localStorage.setItem('nextUserId', '2')
    return defaultUsers
  }
  return JSON.parse(stored)
}

const saveMockUsers = (users) => {
  localStorage.setItem('mockUsers', JSON.stringify(users))
}

const getMockMessages = () => {
  const stored = localStorage.getItem('mockMessages')
  return stored ? JSON.parse(stored) : []
}

const saveMockMessages = (messages) => {
  localStorage.setItem('mockMessages', JSON.stringify(messages))
}

let nextUserId = parseInt(localStorage.getItem('nextUserId') || '1')
let nextMessageId = parseInt(localStorage.getItem('nextMessageId') || '1')

const mockApi = {
  async registerUser({ username, email, password }) {
    const mockUsers = getMockUsers()
    if (mockUsers.find(u => u.username === username)) {
      throw { response: { data: { message: 'Username or email already exists' } } }
    }
    const user = { id: nextUserId++, username, email, password }
    mockUsers.push(user)
    saveMockUsers(mockUsers)
    localStorage.setItem('nextUserId', nextUserId.toString())
    return { data: { message: 'User registered successfully' } }
  },
  
  async login({ username, password }) {
    const mockUsers = getMockUsers()
    const user = mockUsers.find(u => u.username === username && u.password === password)
    if (!user) {
      throw { response: { data: { message: 'Invalid credentials' } } }
    }
    const token = `mock-token-${user.id}-${Date.now()}`
    return { 
      data: { 
        token,
        user: { id: user.id, username: user.username, avatar: 'https://i.pravatar.cc/200' }
      } 
    }
  },
  
  async getMessages() {
    const mockMessages = getMockMessages()
    return { data: mockMessages }
  },
  
  async createMessage({ text }) {
    const userId = localStorage.getItem('userId')
    const username = localStorage.getItem('username')
    const mockMessages = getMockMessages()
    const message = {
      id: nextMessageId++,
      text,
      userId: parseInt(userId),
      username,
      createdAt: new Date().toISOString()
    }
    mockMessages.push(message)
    
    const autoReplies = [
      "Intressant! Berätta mer.",
      "Jag förstår vad du menar.",
      "Det låter spännande!",
      "Tack för att du delade det.",
      "Vad tycker du om det?",
      "Det är en bra poäng!",
      "Jag håller med dig.",
      "Kan du utveckla det mer?",
      "Det låter som en bra idé!",
      "Intressant perspektiv!"
    ]
    
    const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)]
    const botMessage = {
      id: nextMessageId++,
      text: randomReply,
      userId: 999,
      username: 'AutoBot',
      createdAt: new Date().toISOString()
    }
    mockMessages.push(botMessage)
    
    saveMockMessages(mockMessages)
    localStorage.setItem('nextMessageId', nextMessageId.toString())
    return { data: message }
  },
  
  async deleteMessage(id) {
    const userId = localStorage.getItem('userId')
    const mockMessages = getMockMessages()
    const messageIndex = mockMessages.findIndex(m => m.id === parseInt(id))
    if (messageIndex === -1) {
      throw { response: { data: { message: 'Message not found' } } }
    }
    if (mockMessages[messageIndex].userId !== parseInt(userId)) {
      throw { response: { data: { message: 'Unauthorized' } } }
    }
    mockMessages.splice(messageIndex, 1)
    saveMockMessages(mockMessages)
    return { data: { message: 'Message deleted' } }
  }
}

const api = axios.create({ 
  baseURL: 'https://chatify-api.up.railway.app', 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  }
  return config
})

export async function getCSRF() { 
  try {
    const response = await api.patch('/csrf')
    return response
  } catch (error) {
    throw error
  }
}

export async function register({ username, email, password }) {
  if (isDev) return mockApi.registerUser({ username, email, password })
  await ensureCsrf()
  return api.post('/auth/register', { username, email, password })
}

export async function login({ username, password }) {
  if (isDev) return mockApi.login({ username, password })
  await ensureCsrf()
  return api.post('/auth/token', { username, password })
}

export async function getMessages() { 
  if (isDev) {
    return mockApi.getMessages()
  }
  return api.get('/messages') 
}

export async function createMessage({ text }) {
  if (isDev) {
    return mockApi.createMessage({ text })
  }
  return api.post('/messages', { text })
}

export async function deleteMessage(id) {
  if (isDev) {
    return mockApi.deleteMessage(id)
  }
  return api.delete(`/messages/${id}`)
}