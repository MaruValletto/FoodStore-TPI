import { useState } from 'react';
import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { Pedido,EstadoPedido } from '../../../shared/types';
import { money } from '../../../shared/types';
import { getPedidos,changePedido } from '../api/pedidos';
import { AdminNav } from '../../../shared/layout/MainLayout';
import { DataTable } from '../../../shared/components/DataTable';
import { Skeleton,EstadoError } from '../../../shared/components/States';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Paginacion } from '../../../shared/components/Paginacion';
import { DetallePedido } from '../components/DetallePedido';
const states:EstadoPedido[]=['PENDIENTE','EN_PREPARACION','ENTREGADO','CANCELADO'];
export default function AdminPedidosPage(){const [estado,setEstado]=useState<EstadoPedido|undefined>(),[skip,setSkip]=useState(0),cache=useQueryClient();const query=useQuery({queryKey:['pedidos','admin',estado,skip],queryFn:()=>getPedidos({skip,limit:100,estado})});const mutation=useMutation({mutationFn:({id,state}:{id:number;state:EstadoPedido})=>changePedido(id,state),onSuccess:async()=>{await cache.invalidateQueries();}});const columns:ColumnDef<Pedido>[]=[{accessorKey:'id',header:'Pedido'},{accessorKey:'usuario_id',header:'Usuario'},{accessorKey:'estado',header:'Estado',cell:({row})=><BadgeEstado estado={row.original.estado}/>},{accessorKey:'total',header:'Total',cell:({row})=>money(row.original.total)},{id:'detalle',header:'Detalle',cell:({row})=><details><summary className="cursor-pointer">Ver</summary><DetallePedido pedido={row.original}/></details>},{id:'acciones',header:'Acciones',enableSorting:false,cell:({row})=>{const p=row.original;return ['ENTREGADO','CANCELADO'].includes(p.estado)?<span>Finalizado</span>:<div className="flex gap-2"><Button disabled={mutation.isPending} onClick={()=>mutation.mutate({id:p.id,state:p.estado==='PENDIENTE'?'EN_PREPARACION':'ENTREGADO'})}>{p.estado==='PENDIENTE'?'Preparar':'Entregar'}</Button><Button secondary disabled={mutation.isPending} onClick={()=>{if(window.confirm('¿Cancelar y restituir el stock?'))mutation.mutate({id:p.id,state:'CANCELADO'});}}>Cancelar</Button></div>;}}];return <><AdminNav/><div className="mb-7 flex flex-wrap justify-between gap-4"><h1 className="title">Pedidos</h1><label>Estado<select className="field mt-2" value={estado??''} onChange={e=>{setEstado(states.find(x=>x===e.target.value));setSkip(0);}}><option value="">Todos</option>{states.map(x=><option key={x}>{x}</option>)}</select></label></div>{mutation.isError&&<EstadoError error={mutation.error}/>} {query.isPending?<Skeleton/>:query.isError?<EstadoError error={query.error}/>:<><DataTable label="Pedidos" data={query.data.items} columns={columns}/><Paginacion skip={skip} limit={100} total={query.data.total} onChange={setSkip}/></>}</>;}
