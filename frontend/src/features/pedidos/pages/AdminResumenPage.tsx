import { useQuery } from '@tanstack/react-query';
import { getResumen } from '../api/pedidos';
import { AdminNav } from '../../../shared/layout/MainLayout';
import { Skeleton,EstadoError } from '../../../shared/components/States';
import { money } from '../../../shared/types';
export default function AdminResumenPage(){const query=useQuery({queryKey:['resumen'],queryFn:getResumen});return <><AdminNav/><h1 className="title mb-7">La casa, en números</h1>{query.isPending?<Skeleton/>:query.isError?<EstadoError error={query.error}/>:<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(query.data).map(([key,value])=><article className="panel" key={key}><p className="eyebrow">{key.replaceAll('_',' ')}</p><p className="mt-4 font-display text-4xl font-bold">{key==='ingresos_entregados'?money(value):value}</p></article>)}</div>}</>;}
