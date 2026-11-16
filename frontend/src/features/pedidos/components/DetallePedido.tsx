import type { Pedido } from '../../../shared/types';
import { money } from '../../../shared/types';
export const DetallePedido=({pedido}:{pedido:Pedido})=><div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">{pedido.items.map(x=><div key={x.producto_id} className="flex justify-between gap-4"><span>{x.cantidad} × {x.nombre_producto} ({money(x.precio_unitario)})</span><strong>{money(x.subtotal)}</strong></div>)}<p className="pt-3 text-slate-600">Entrega: {pedido.direccion_entrega} · {pedido.forma_pago}</p>{pedido.notas&&<p>Notas: {pedido.notas}</p>}</div>;
