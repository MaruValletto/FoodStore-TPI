import { message } from '../api/handleApiError';
import { Button } from '../ui/Button';
export const Skeleton=()=> <div role="status" aria-label="Cargando" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(x=><div key={x} className="h-60 animate-pulse rounded-2xl bg-[#ecdfcc]"/>)}</div>;
export const EstadoVacio=({text}:{text:string})=><p className="panel text-slate-600">{text}</p>;
export const EstadoError=({error,retry}:{error:unknown;retry?:()=>void})=><div role="alert" className="error">{message(error)}{retry&&<Button secondary className="ml-4" onClick={retry}>Reintentar</Button>}</div>;
export const FieldError=({errors}:{errors:readonly unknown[]})=><>{[...new Set(errors.map(x=>typeof x==='string'?x:'Revisá el campo'))].map(x=><span role="alert" key={x} className="block text-xs text-red-800">{x}</span>)}</>;
