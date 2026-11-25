import {createContext,useContext,useEffect,useState} from 'react';import api from '../api';
const Ctx=createContext();export const useAuth=()=>useContext(Ctx);
export function AuthProvider({children}){const [user,setUser]=useState(null),[loading,setLoading]=useState(!!localStorage.getItem('token'));
 useEffect(()=>{if(localStorage.getItem('token'))api.get('/auth/me').then(r=>setUser(r.data)).catch(()=>localStorage.removeItem('token')).finally(()=>setLoading(false))},[]);
 const enter=d=>{localStorage.setItem('token',d.token);setUser(d.user)};
 const login=async(email,password)=>enter((await api.post('/auth/login',{email,password})).data);
 const register=async f=>enter((await api.post('/auth/register',f)).data);
 const logout=()=>{localStorage.removeItem('token');setUser(null)};
 return <Ctx.Provider value={{user,setUser,loading,login,register,logout}}>{children}</Ctx.Provider>}
