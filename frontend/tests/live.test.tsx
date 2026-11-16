import { describe,it,expect,afterEach } from 'vitest';
import { render,screen,cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter,Routes,Route } from 'react-router-dom';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { api } from '../src/shared/api/axiosInstance';
import { useCartStore } from '../src/store/cartStore';
import { useAuthStore } from '../src/store/authStore';
import CatalogoPage from '../src/features/productos/pages/CatalogoPage';
import CheckoutPage from '../src/features/pedidos/pages/CheckoutPage';
import type { Producto,Page,Pedido } from '../src/shared/types';
afterEach(cleanup);
const live=process.env.RUN_LIVE_API==='1';
function show(element:React.ReactNode){const client=new QueryClient({defaultOptions:{queries:{retry:false}}});render(<QueryClientProvider client={client}><MemoryRouter><Routes><Route path="/" element={element}/><Route path="/mis-pedidos" element={<p>Compra recibida</p>}/></Routes></MemoryRouter></QueryClientProvider>);}
describe.skipIf(!live)('Integración con API y PostgreSQL reales',()=>{
 it('muestra el catálogo servido por la API',async()=>{show(<CatalogoPage/>);await screen.findAllByRole('button',{name:'Agregar al carrito'},{timeout:10000});expect(screen.getByLabelText('Categoría')).toBeTruthy();});
 it('registra un cliente, compra desde el formulario y recupera stock al cancelar',async()=>{
  await api.post('/auth/logout');
  const name='live'+Date.now();await api.post('/auth/register',{username:name,full_name:'Cliente integración',email:name+'@example.com',password:'Clave1234!'});
  await useAuthStore.getState().login(name,'Clave1234!');
  const {data:catalog}=await api.get<Page<Producto>>('/productos',{params:{limit:100}});
  const p=catalog.items.find(x=>x.disponible&&x.stock>0);expect(p).toBeTruthy();if(!p)throw new Error('No hay stock de prueba');
  useCartStore.getState().vaciar();useCartStore.getState().agregar(p);
  show(<CheckoutPage/>);const user=userEvent.setup();await user.type(screen.getByPlaceholderText('Calle, número y localidad'),'San Martín 123');await user.click(screen.getByRole('button',{name:'Confirmar pedido'}));
  await screen.findByText('Compra recibida',{}, {timeout:10000});expect(useCartStore.getState().items).toHaveLength(0);
  const {data:orders}=await api.get<Page<Pedido>>('/pedidos');expect(orders.total).toBe(1);
  expect((await api.get<Producto>('/productos/'+p.id)).data.stock).toBe(p.stock-1);
  await api.patch('/pedidos/'+orders.items[0].id+'/cancelar');
  expect((await api.get<Producto>('/productos/'+p.id)).data.stock).toBe(p.stock);
  await useAuthStore.getState().logout();
 });
});
