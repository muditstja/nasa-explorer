import React, { useEffect, useState } from 'react'
import { fetchAPOD } from '../api'

export default function APODPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchAPOD().then(d => { setData(d); setErr(null) }).catch(e => setErr(e)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="mx-auto max-w-5xl mt-8 px-6"><div className="h-72 rounded-2xl skel" /></div>
  if (err) return <ErrorBox title="Couldn’t load APOD" detail={err.message} />

  return (
    <div className="mx-auto max-w-6xl px-6 mt-8 grid md:grid-cols-2 gap-6 items-start">
      <img src={data.url} alt={data.title} className="w-full rounded-2xl shadow-glow object-cover aspect-[16/10]" />
      <div className="card p-6">
        <h3 className="text-2xl font-semibold">{data.title}</h3>
        <p className="mt-2 text-white/70">{data.explanation}</p>
        <p className="mt-4 text-sm text-white/40">{data.date}</p>
      </div>
    </div>
  )
}

function ErrorBox({ title, detail }) {
  return (
    <div className="mx-auto max-w-4xl mt-8 px-6">
      <div className="card p-6 border-red-400/30">
        <h3 className="text-lg font-semibold text-red-300">{title}</h3>
        <p className="text-white/70 mt-2">{detail}</p>
      </div>
    </div>
  )
}