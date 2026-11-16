import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto } from '../shared/types';
export interface CartItem {producto_id:number;nombre:string;precio_unitario:number;cantidad:number}
interface Cart {items:CartItem[];agregar:(p:Producto)=>void;quitar:(id:number)=>void;cambiarCantidad:(id:number,n:number)=>void;vaciar:()=>void;total:()=>number}
export const useCartStore=create<Cart>()(persist((set,get)=>({items:[],
 agregar:p=>set(state=>{const item=state.items.find(x=>x.producto_id===p.id);if(item&&item.cantidad>=p.stock)return state;return {items:item?state.items.map(x=>x.producto_id===p.id?{...x,cantidad:x.cantidad+1}:x):[...state.items,{producto_id:p.id,nombre:p.nombre,precio_unitario:p.precio_base,cantidad:1}]};}),
 quitar:id=>set(state=>({items:state.items.filter(x=>x.producto_id!==id)})),
 cambiarCantidad:(id,n)=>{if(Number.isInteger(n)&&n>=1)set(state=>({items:state.items.map(x=>x.producto_id===id?{...x,cantidad:n}:x)}));},
 vaciar:()=>set({items:[]}),total:()=>get().items.reduce((total,x)=>total+x.precio_unitario*x.cantidad,0)
}),{name:'foodstore-cart',partialize:state=>({items:state.items})}));
