import axios from 'axios';
const api=axios.create({baseURL:'/api'});
api.interceptors.request.use(c=>{const t=localStorage.getItem('token');if(t)c.headers.Authorization='Bearer '+t;return c});
api.interceptors.response.use(r=>r,e=>{if(e.response?.status===401&&!location.pathname.startsWith('/login')){localStorage.removeItem('token');location.href='/login'}return Promise.reject(e)});
export const errMsg=e=>e.response?.data?.message||e.message;
export async function download(path,filename){const r=await api.get(path,{responseType:'blob'});const a=document.createElement('a');a.href=URL.createObjectURL(r.data);a.download=filename;a.click()}
export default api;
