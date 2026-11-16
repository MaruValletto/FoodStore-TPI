import { api } from '../../../shared/api/axiosInstance';
import type { Producto,Categoria,Page } from '../../../shared/types';
export const getProductos=async(params:{skip:number;limit:number;search?:string;categoria_id?:number})=>(await api.get<Page<Producto>>('/productos',{params})).data;
export const getCategorias=async()=>(await api.get<Categoria[]>('/categorias')).data;
