import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '../../../shared/types';
import { api } from '../../../shared/api/axiosInstance';
import { useAuthStore } from '../../../store/authStore';
import { AdminNav } from '../../../shared/layout/MainLayout';
import { DataTable } from '../../../shared/components/DataTable';
import { Skeleton,EstadoError } from '../../../shared/components/States';
import { Button } from '../../../shared/ui/Button';
export default function AdminUsuariosPage(){const user=useAuthStore(x=>x.usuario),cache=useQueryClient();const query=useQuery({queryKey:['usuarios'],queryFn:async()=>(await api.get<User[]>('/admin/usuarios')).data});const mutation=useMutation({mutationFn:(row:User)=>api.post(`/admin/usuarios/${row.id}/${row.disabled?'activar':'desactivar'}`),onSuccess:async()=>{await cache.invalidateQueries({queryKey:['usuarios']});}});const columns:ColumnDef<User>[]=[{accessorKey:'username',header:'Usuario'},{accessorKey:'full_name',header:'Nombre'},{accessorKey:'email',header:'Email'},{accessorKey:'role',header:'Rol'},{accessorKey:'disabled',header:'Estado',cell:({row})=>row.original.disabled?'Desactivado':'Activo'},{id:'acciones',header:'Acciones',cell:({row})=>row.original.id===user?.id?<span>Tu cuenta</span>:<Button secondary disabled={mutation.isPending} onClick={()=>mutation.mutate(row.original)}>{row.original.disabled?'Activar':'Desactivar'} {row.original.username}</Button>}];return <><AdminNav/><h1 className="title mb-7">Usuarios</h1>{mutation.isError&&<EstadoError error={mutation.error}/>} {query.isPending?<Skeleton/>:query.isError?<EstadoError error={query.error}/>:<DataTable label="Usuarios" data={query.data} columns={columns}/>}</>;}
