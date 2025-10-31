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
  return api.get('/messages')
}

export async function createMessage({ text }) {
  return api.post('/messages', { text })
}

export async function deleteMessage(id) {
  return api.delete(`/messages/${id}`)
}