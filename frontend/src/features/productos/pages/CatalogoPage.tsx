import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductos, getCategorias } from '../api/productos';
import { mediaUrl } from '../../../shared/api/axiosInstance';
import { useCartStore } from '../../../store/cartStore';
import { money } from '../../../shared/types';
import { Button } from '../../../shared/ui/Button';
import { Skeleton, EstadoVacio, EstadoError } from '../../../shared/components/States';
import { Paginacion } from '../../../shared/components/Paginacion';

export default function CatalogoPage() {
  const [skip,setSkip] = useState(0);
  const [search,setSearch] = useState('');
  const [cat,setCat] = useState('');
  const [notice,setNotice] = useState('');
  const filtros = {skip,limit:9,search,categoria_id:cat ? Number(cat) : undefined};
  const query = useQuery({queryKey:['productos',filtros],queryFn:() => getProductos(filtros)});
  const cats = useQuery({queryKey:['categorias'],queryFn:getCategorias});
  const add = useCartStore(x => x.agregar);
  const cart = useCartStore(x => x.items);
  const selectCategory = (value:string) => {setCat(value);setSkip(0);};
  return <>
    <div className="mb-7">
      <p className="eyebrow">Todo listo para servir</p>
      <h1 className="title mt-2">Nuestro catálogo</h1>
      <p className="mt-2 text-sm text-slate-500">Elegí tus favoritos y armá tu pedido.</p>
    </div>
    <div className="grid items-start gap-6 lg:grid-cols-[210px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4" aria-label="Filtrar por categoría">
        <h2 className="mb-3 text-sm font-semibold">Categorías</h2>
        <div className="hidden gap-1 lg:flex lg:flex-col">
          <button aria-pressed={!cat} onClick={() => selectCategory('')} className={'rounded-xl px-3 py-2.5 text-left text-sm '+(!cat ? 'bg-orange-50 font-semibold text-orange-800' : 'hover:bg-slate-50')}>Todos los productos</button>
          {cats.data?.map(c => <button key={c.id} aria-pressed={cat===String(c.id)} onClick={() => selectCategory(String(c.id))} className={'rounded-xl px-3 py-2.5 text-left text-sm '+(cat===String(c.id) ? 'bg-orange-50 font-semibold text-orange-800' : 'hover:bg-slate-50')}>{c.nombre}</button>)}
        </div>
        <label className="block text-sm lg:hidden">Categoría
          <select className="field mt-2" value={cat} onChange={e => selectCategory(e.target.value)}>
            <option value="">Todos los productos</option>
            {cats.data?.map(c => <option value={c.id} key={c.id}>{c.nombre}</option>)}
          </select>
        </label>
        {cats.isError && <EstadoError error={cats.error} retry={() => {void cats.refetch();}} />}
      </aside>
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <label className="min-w-48 flex-1 text-sm font-medium">Buscar producto
            <input className="field mt-1.5" type="search" value={search} onChange={e => {setSearch(e.target.value);setSkip(0);}} placeholder="Pizza, hamburguesa, postre…" />
          </label>
          {query.data && <p className="pb-2 text-xs text-slate-500">{query.data.total} productos</p>}
        </div>
        {notice && <p role="status" className="notice">{notice}</p>}
        {query.isPending ? <Skeleton /> : query.isError ? <EstadoError error={query.error} retry={() => {void query.refetch();}} /> : !query.data.items.length ? <EstadoVacio text="No encontramos productos. Probá otra búsqueda." /> : <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.items.map(p => {
              const count = cart.find(x => x.producto_id===p.id)?.cantidad ?? 0;
              return <article key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-44 bg-orange-50">
                  <img src={p.imagen_url ? mediaUrl(p.imagen_url) : '/img/logo1.png'} alt={p.nombre} loading="lazy" className="h-full w-full object-cover" onError={e => {if(!e.currentTarget.src.endsWith('/img/logo1.png'))e.currentTarget.src='/img/logo1.png';}} />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-orange-800">{p.categoria.nombre}</span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-semibold">{p.nombre}</h2>
                  <p className="mt-1 min-h-10 text-sm text-slate-500">{p.descripcion || 'Sin descripción'}</p>
                  <p className="mt-4 text-xl font-bold text-orange-700">{money(p.precio_base)}</p>
                  <p className="mt-1 text-sm">Stock: <strong>{p.stock} unidades</strong></p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className={'rounded-full px-2.5 py-1 '+(p.disponible ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800')}>{p.disponible ? 'Venta habilitada' : 'Venta pausada'}</span>
                    <span className={'rounded-full px-2.5 py-1 '+(p.stock>0 ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-700')}>{p.stock>0 ? 'Con stock' : 'Sin stock'}</span>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <Button className="w-full" disabled={!p.disponible || p.stock===0 || count>=p.stock} onClick={() => {add(p);setNotice(p.nombre+' agregado al carrito.');}}>{!p.disponible || !p.stock ? 'No disponible' : count>=p.stock ? 'Stock agregado al carrito' : 'Agregar al carrito'}</Button>
                  </div>
                </div>
              </article>;
            })}
          </div>
          <Paginacion skip={skip} limit={9} total={query.data.total} onChange={setSkip} />
        </>}
      </div>
    </div>
  </>;
}
