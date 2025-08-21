import { defer, map, catchError, of, shareReplay } from 'rxjs'
import {fetchNEO} from './api.service'

export function fetchNeoFeed$(start:string, end:string){
  return defer(()=> fetchNEO(start, end)).pipe(
    map(data=> data),
    catchError(err=> of({ error: err?.message || 'NeoWs error' } as any)),
    shareReplay(1)
  )
}
export function fetchNeoByDay$(start:string, end:string){
  return fetchNeoFeed$(start, end).pipe(map((d:any)=> d?.objects || {}))
}
export function fetchNeoFlattened$(start:string, end:string){
  return fetchNeoFeed$(start,end).pipe(map((d:any)=> Object.values(d?.objects||{}).flat()))
}
