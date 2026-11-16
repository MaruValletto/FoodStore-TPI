import { beforeEach,afterEach,describe,it,expect,vi } from 'vitest';
import { render,screen,cleanup,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter,Routes,Route } from 'react-router-dom';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { AxiosError,AxiosHeaders } from 'axios';
import { api } from '../src/shared/api/axiosInstance';
import { useAuthStore } from '../src/store/authStore';
import { useCartStore } from '../src/store/cartStore';
import { ProtectedRoute } from '../src/routes/ProtectedRoute';
import LoginPage from '../src/features/auth/pages/LoginPage';
import CheckoutPage from '../src/features/pedidos/pages/CheckoutPage';
import type { Producto,User } from '../src/shared/types';

const usuario:User={id:2,username:'cliente',full_name:'Cliente',email:'cliente@example.com',role:'user',disabled:false,created_at:'2026-11-15'};
const producto:Producto={id:10,categoria_id:1,nombre:'Pizza',descripcion:'Pizza de prueba',precio_base:1200,stock:3,disponible:true,activo:true,imagen_url:'/media/pizza.png',categoria:{id:1,nombre:'Pizzas',descripcion:'',activo:true}};
const originalAdapter=api.defaults.adapter;
beforeEach(()=>{localStorage.clear();useAuthStore.setState({usuario:null,cargando:false});useCartStore.getState().vaciar();});
afterEach(()=>{cleanup();api.defaults.adapter=originalAdapter;vi.restoreAllMocks();});
function renderPage(page:React.ReactNode){const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});return render(<QueryClientProvider client={client}><MemoryRouter><Routes><Route path="/" element={page}/><Route path="/mis-pedidos" element={<p>Pedido confirmado</p>}/></Routes></MemoryRouter></QueryClientProvider>);}
describe('Carrito persistente',()=>{
 it('agrupa productos, limita agregados al stock y recalcula el total',()=>{const cart=useCartStore.getState();for(let i=0;i<5;i++)cart.agregar(producto);expect(useCartStore.getState().items).toHaveLength(1);expect(useCartStore.getState().items[0].cantidad).toBe(3);expect(cart.total()).toBe(3600);cart.cambiarCantidad(10,2);expect(cart.total()).toBe(2400);cart.cambiarCantidad(10,0);expect(cart.total()).toBe(2400);cart.quitar(10);expect(cart.total()).toBe(0);});
 it('persiste el contenido y conserva las acciones después de rehidratar',async()=>{useCartStore.getState().agregar(producto);useCartStore.setState({items:[]});localStorage.setItem('foodstore-cart',JSON.stringify({state:{items:[{producto_id:10,nombre:'Pizza',precio_unitario:1200,cantidad:2}]},version:0}));await useCartStore.persist.rehydrate();expect(useCartStore.getState().total()).toBe(2400);});
});
describe('Autenticación y permisos',()=>{
 it('persiste solamente el usuario, sin credenciales ni estado de carga',()=>{useAuthStore.setState({usuario,cargando:false});const saved=JSON.parse(localStorage.getItem('foodstore-auth')??'{}');expect(Object.keys(saved.state)).toEqual(['usuario']);expect(JSON.stringify(saved)).not.toContain('password');});
 it('redirige a un cliente que intenta entrar en administración',()=>{useAuthStore.setState({usuario,cargando:false});render(<MemoryRouter initialEntries={['/admin']}><Routes><Route element={<ProtectedRoute admin/>}><Route path="/admin" element={<p>Administración privada</p>}/></Route><Route path="/unauthorized" element={<p>Acceso restringido</p>}/></Routes></MemoryRouter>);expect(screen.getByText('Acceso restringido')).toBeTruthy();expect(screen.queryByText('Administración privada')).toBeNull();});
 it('envía el formulario de ingreso y obtiene la sesión desde la API',async()=>{const calls:string[]=[];api.defaults.adapter=async config=>{calls.push(config.url??'');return {data:config.url==='/auth/me'?usuario:{message:'Login exitoso'},status:200,statusText:'OK',headers:{},config};};renderPage(<LoginPage/>);const user=userEvent.setup();await user.type(screen.getByLabelText('Usuario'),'cliente');await user.type(screen.getByLabelText('Contraseña'),'Clave1234!');await user.click(screen.getByRole('button',{name:'Ingresar'}));await waitFor(()=>expect(useAuthStore.getState().usuario?.username).toBe('cliente'));expect(calls).toEqual(['/auth/token','/auth/me']);});
 it('limpia la sesión cuando la cuenta queda desactivada',async()=>{useAuthStore.setState({usuario});api.defaults.adapter=async config=>{throw new AxiosError('desactivado','ERR_BAD_REQUEST',config,undefined,{data:{detail:'Cuenta de usuario desactivada'},status:400,statusText:'Bad Request',headers:new AxiosHeaders(),config});};await expect(api.get('/pedidos')).rejects.toBeTruthy();expect(useAuthStore.getState().usuario).toBeNull();});
});
describe('Confirmación de pedidos',()=>{
 it('valida dirección, envía IDs y cantidades y vacía el carrito al confirmar',async()=>{useCartStore.getState().agregar(producto);const calls:unknown[]=[];api.defaults.adapter=async config=>{calls.push(JSON.parse(config.data));return {data:{id:1},status:201,statusText:'Created',headers:{},config};};renderPage(<CheckoutPage/>);const user=userEvent.setup();await user.click(screen.getByRole('button',{name:'Confirmar pedido'}));expect(calls).toHaveLength(0);await user.type(screen.getByPlaceholderText('Calle, número y localidad'),'San Martín 123');await user.click(screen.getByRole('button',{name:'Confirmar pedido'}));await screen.findByText('Pedido confirmado');expect(calls).toEqual([{direccion_entrega:'San Martín 123',forma_pago:'EFECTIVO',notas:'',items:[{producto_id:10,cantidad:1}]}]);expect(useCartStore.getState().items).toHaveLength(0);});
 it('conserva el carrito si la API rechaza el pedido',async()=>{useCartStore.getState().agregar(producto);api.defaults.adapter=async config=>{throw new AxiosError('Stock insuficiente','ERR_BAD_REQUEST',config,undefined,{data:{detail:'Stock insuficiente'},status:400,statusText:'Bad Request',headers:new AxiosHeaders(),config});};renderPage(<CheckoutPage/>);const user=userEvent.setup();await user.type(screen.getByPlaceholderText('Calle, número y localidad'),'San Martín 123');await user.click(screen.getByRole('button',{name:'Confirmar pedido'}));await screen.findByText('Stock insuficiente');expect(useCartStore.getState().items[0].cantidad).toBe(1);});
});
