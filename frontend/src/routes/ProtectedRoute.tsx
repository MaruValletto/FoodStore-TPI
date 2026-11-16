import { Navigate,Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Skeleton } from '../shared/components/States';
export const ProtectedRoute=({admin=false}:{admin?:boolean})=>{const {usuario,cargando}=useAuthStore();if(cargando)return <Skeleton/>;if(!usuario)return <Navigate to="/login" replace/>;if(admin&&usuario.role!=='admin')return <Navigate to="/unauthorized" replace/>;return <Outlet/>;};
