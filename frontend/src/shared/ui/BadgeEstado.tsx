import type { EstadoPedido } from '../types';
const color:Record<EstadoPedido,string>={PENDIENTE:'bg-amber-100 text-amber-900',EN_PREPARACION:'bg-blue-100 text-blue-900',ENTREGADO:'bg-emerald-100 text-emerald-900',CANCELADO:'bg-slate-100 text-slate-600'};
export const BadgeEstado=({estado}:{estado:EstadoPedido})=><span className={`badge ${color[estado]}`}>{estado.replace('_',' ')}</span>;
