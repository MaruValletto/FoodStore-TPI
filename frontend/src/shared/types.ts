export interface User { id:number; username:string; full_name:string; email:string; role:'user'|'admin'; disabled:boolean; created_at:string }
export interface Categoria { id:number;nombre:string;descripcion:string;activo:boolean }
export interface Producto { id:number;categoria_id:number;nombre:string;descripcion:string;precio_base:number;imagen_url:string;stock:number;disponible:boolean;activo:boolean;categoria:Categoria }
export type EstadoPedido='PENDIENTE'|'EN_PREPARACION'|'ENTREGADO'|'CANCELADO';
export interface DetallePedido { producto_id:number;nombre_producto:string;precio_unitario:number;cantidad:number;subtotal:number }
export interface Pedido { id:number;usuario_id:number;estado:EstadoPedido;forma_pago:string;direccion_entrega:string;notas:string;total:number;created_at:string;updated_at:string;items:DetallePedido[] }
export interface ResumenPedidos { pendientes:number;en_preparacion:number;entregados:number;cancelados:number;pedidos_hoy:number;ingresos_entregados:number }
export interface Page<T> {total:number;items:T[]}
export const money=(value:number)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS'}).format(value);
