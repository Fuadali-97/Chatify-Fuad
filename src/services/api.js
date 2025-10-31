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
    sessionStorage.setItem('csrfToken', csrfToken)
  }
  return res
}

export async function register({ username, email, password }) {
  await getCSRF()
  const csrfToken = sessionStorage.getItem('csrfToken')
  return api.post('/auth/register', { username, email, password, csrfToken })
}

export async function login({ username, password }) {
  await getCSRF()
  const csrfToken = sessionStorage.getItem('csrfToken')
  return api.post('/auth/token', { username, password, csrfToken })
}

export async function getMessages() {
  const res = await api.get('/messages')
  if (res.data?.messages) {
    return { data: res.data.messages }
  }
  return res
}

export async function createMessage({ message }) {
  const csrfToken = sessionStorage.getItem('csrfToken')
  const res = await api.post(
    '/messages',
    { message },
    { headers: { 'X-CSRF-Token': csrfToken } }
  )
  return res.data
}

export async function deleteMessage(id) {
  return api.delete(`/messages/${id}`)
}