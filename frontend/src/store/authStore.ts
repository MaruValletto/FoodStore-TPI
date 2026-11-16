import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../shared/api/axiosInstance';
import { queryClient } from '../shared/api/queryClient';
import type { User } from '../shared/types';
interface AuthState { usuario:User|null;cargando:boolean;login:(username:string,password:string)=>Promise<void>;logout:()=>Promise<void>;checkSession:()=>Promise<void>;clear:()=>void }
export const useAuthStore=create<AuthState>()(persist((set)=>({
  usuario:null,cargando:true,
  clear:()=>set({usuario:null,cargando:false}),
  login:async(username,password)=>{await api.post('/auth/token',new URLSearchParams({username,password}));const {data}=await api.get<User>('/auth/me');queryClient.clear();set({usuario:data,cargando:false});},
  logout:async()=>{await api.post('/auth/logout');queryClient.clear();set({usuario:null,cargando:false});},
  checkSession:async()=>{try{const {data}=await api.get<User>('/auth/me');set({usuario:data,cargando:false});}catch{set({usuario:null,cargando:false});}},
}),{name:'foodstore-auth',partialize:state=>({usuario:state.usuario})}));
