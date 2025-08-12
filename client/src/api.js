import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787', // your Express
  timeout: 12000
})

export async function fetchAPOD() {
  const { data } = await api.get('/api/apod')
  return data
}

export async function fetchNEO(start, end) {
  const { data } = await api.get('/api/neo', { params: { start_date: start, end_date: end } })
  return data
}

export async function fetchMars({ rover = 'curiosity', sol = 1000, camera = '', page = 1 }) {
  const { data } = await api.get('/api/mars/photos', { params: { rover, sol, camera, page } })
  return data
}

export async function searchMedia(q) {
  const { data } = await api.get('/api/search', { params: { q, media_type: 'image' } })
  return data
}