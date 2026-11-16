import { useState } from 'react';
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { getPedidos,cancelPedido } from '../api/pedidos';
import { useAuthStore } from '../../../store/authStore';
import { money } from '../../../shared/types';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Skeleton,EstadoError,EstadoVacio } from '../../../shared/components/States';
import { Paginacion } from '../../../shared/components/Paginacion';
import { DetallePedido } from '../components/DetallePedido';
export default function MisPedidosPage(){const user=useAuthStore(x=>x.usuario),[skip,setSkip]=useState(0),cache=useQueryClient();const query=useQuery({queryKey:['pedidos','mis',user?.id,skip],queryFn:()=>getPedidos({skip,limit:10})});const cancel=useMutation({mutationFn:cancelPedido,onSuccess:async()=>{await cache.invalidateQueries();}});return <><p className="eyebrow">El recorrido de tu compra</p><h1 className="title mt-2 mb-7">Mis pedidos</h1>{cancel.isError&&<EstadoError error={cancel.error}/>} {query.isPending?<Skeleton/>:query.isError?<EstadoError error={query.error} retry={()=>{void query.refetch();}}/>:!query.data.items.length?<EstadoVacio text="Todavía no tenés pedidos."/>:<><div className="space-y-5">{query.data.items.map(p=><article className="panel" key={p.id}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold">Pedido #{p.id}</h2><BadgeEstado estado={p.estado}/><strong>{money(p.total)}</strong><span className="text-xs text-slate-500">{new Date(p.created_at).toLocaleString('es-AR')}</span></div><details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-orange-800">Ver detalle</summary><DetallePedido pedido={p}/></details>{p.estado==='PENDIENTE'&&p.usuario_id===user?.id&&<Button secondary className="mt-4" disabled={cancel.isPending} onClick={()=>{if(window.confirm('¿Cancelar este pedido?'))cancel.mutate(p.id);}}>Cancelar pedido #{p.id}</Button>}</article>)}</div><Paginacion skip={skip} limit={10} total={query.data.total} onChange={setSkip}/></>}</>;}
