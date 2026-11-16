import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { queryClient } from './queryClient';
export const API_URL=(import.meta.env.VITE_API_URL||'http://localhost:8000/api/v1').replace(/\/$/,'');
export const api=axios.create({baseURL:API_URL,withCredentials:true,timeout:15000});
api.interceptors.response.use(response=>response,error=>{
  if(axios.isAxiosError(error)){
    const url=error.config?.url??'';
    if((error.response?.status===401&&!['/auth/token','/auth/me'].some(path=>url.includes(path)))||(error.response?.status===400&&error.response?.data?.detail==='Cuenta de usuario desactivada')){
      useAuthStore.getState().clear();queryClient.clear();
    }
  }
  return Promise.reject(error);
});
export const mediaUrl=(path:string)=>path.startsWith('/')?API_URL.replace(/\/api\/v1$/,'')+path:path;
