import { api } from '../../../shared/api/axiosInstance';
import type { Pedido,Page,EstadoPedido,ResumenPedidos } from '../../../shared/types';
export interface PedidoInput {items:{producto_id:number;cantidad:number}[];forma_pago:'EFECTIVO'|'TRANSFERENCIA';direccion_entrega:string;notas:string}
export const getPedidos=async(params:{skip:number;limit:number;estado?:EstadoPedido})=>(await api.get<Page<Pedido>>('/pedidos',{params})).data;
export const createPedido=async(data:PedidoInput)=>(await api.post<Pedido>('/pedidos',data)).data;
export const cancelPedido=async(id:number)=>(await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data;
export const changePedido=async(id:number,estado:EstadoPedido)=>(await api.patch<Pedido>(`/pedidos/${id}/estado`,{estado})).data;
export const getResumen=async()=>(await api.get<ResumenPedidos>('/pedidos/resumen')).data;
