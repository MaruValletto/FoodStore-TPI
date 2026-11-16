import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { message } from '../api/handleApiError';

export function MainLayout() {
  const user = useAuthStore(x => x.usuario);
  const logout = useAuthStore(x => x.logout);
  const items = useCartStore(x => x.items);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const navClass = ({isActive}: {isActive: boolean}) =>
    'rounded-xl px-3 py-2 text-sm transition ' + (isActive ? 'bg-white/20 font-semibold' : 'hover:bg-white/10');
  return <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
    <header className="border-b border-orange-600 bg-brand text-white">
      <nav aria-label="Principal" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="FoodStore, inicio">
          <img src="/img/logo1.png" alt="" className="h-12 w-12 object-contain" />
          <span className="text-2xl font-bold tracking-tight">Food<span className="text-amber-300">Store</span></span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <NavLink end to="/" className={navClass}>La carta</NavLink>
          <NavLink to="/carrito" className={state => navClass(state)+' inline-flex items-center gap-2'}>
            Carrito
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold tabular-nums text-orange-700" aria-label={`${items.reduce((n,x) => n+x.cantidad,0)} unidades en el carrito`}>
              {items.reduce((n,x) => n+x.cantidad,0)}
            </span>
          </NavLink>
          {user ? <>
            <NavLink to="/mis-pedidos" className={navClass}>Mis pedidos</NavLink>
            {user.role === 'admin' && <NavLink to="/admin/resumen" className={navClass}>Administración</NavLink>}
            <span className="px-2 text-xs">{user.full_name} · {user.role === 'admin' ? 'Administrador' : 'Cliente'}</span>
            <button className="rounded-xl border border-white/50 px-3 py-2 text-sm font-medium hover:bg-white/10" onClick={() => {
              setError('');
              void logout().then(() => navigate('/login')).catch(e => setError(message(e)));
            }}>Cerrar sesión</button>
          </> : <>
            <NavLink to="/login" className={navClass}>Ingresar</NavLink>
            <Link className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-orange-800 hover:bg-orange-50" to="/register">Crear cuenta</Link>
          </>}
        </div>
      </nav>
    </header>
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
      {error && <p className="error" role="alert">{error}</p>}<Outlet />
    </main>
    <footer className="mt-10 border-t border-slate-200 px-5 py-6 text-center text-xs text-slate-500">
      FoodStore · Marianela Valletto · TPI Programación IV · UTN
    </footer>
  </div>;
}

export const AdminNav = () => <nav aria-label="Panel de administración" className="mb-7 flex flex-wrap gap-3">
  {['resumen','categorias','productos','pedidos','usuarios'].map(x => <NavLink
    className={({isActive}) => isActive ? 'button-primary' : 'button-secondary'}
    key={x} to={'/admin/'+x}>{({resumen:'Resumen',categorias:'Categorías',productos:'Productos',pedidos:'Pedidos',usuarios:'Usuarios'})[x]}</NavLink>)}
</nav>;
