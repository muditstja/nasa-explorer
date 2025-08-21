import axios from 'axios';
import { getTodayAndSevenDaysAgo } from '../helpers/date.helper';

const api = axios.create({
  baseURL: 'https://nasa-explorer-l5v6.onrender.com',
  timeout: 12000
})

export async function fetchAPOD(date: string) {
  const { data } = await api.get(`/api/apod?date=${date}`)
  return data
}

export async function fetchNEO(startDate: string, endDate: string) {
  const { data } = await api.get('/api/neo', { params: { start_date: startDate, end_date: endDate } })
  return data
}

export async function fetchMars(params: any) {
  const { data } = await api.get('/api/mars', { params: params })
  return data
}

export async function fetchEonet(params: any) {
    const {data} = await api.get('/api/events', {params});
    return data;
}

export async function fetchDonki() {
  const { today, sevenDaysAgo } = getTodayAndSevenDaysAgo();
  const {data} = await api.get(`/api/donki?start_date=${sevenDaysAgo}&end_date=${today}&type=ALL`)
  return data;
}

export async function fetchTechTransfer(category: string, query: string, page = 1) {
    const {data} = await api.get(`/api/tech?category=${category}&query=${encodeURIComponent(query)}&page=${page}`)
    return data;
}