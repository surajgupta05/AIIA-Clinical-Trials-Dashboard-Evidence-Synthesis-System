import {useEffect,useState,useCallback} from 'react';import {useForm} from 'react-hook-form';import {useSearchParams} from 'react-router-dom';import {Plus,Pencil,Trash2,X,Download,Search} from 'lucide-react';
import api,{errMsg,download} from '../api';import {useAuth} from '../context/Auth';
export const get=(o,p)=>p.split('.').reduce((a,k)=>a?.[k],o);
export const fmt=v=>v==null?'':typeof v==='boolean'?(v?'Yes':'No'):typeof v==='string'&&/^\d{4}-\d\d-\d\dT/.test(v)?v.slice(0,10):typeof v==='object'?(v.title||v.name||v.code||''):String(v);
const lbl=(r,o)=>r==='patients'?`${o.code} ${o.name}`:o.title||o.name;
export const Badge=({v})=>{const c={Active:'bg-emerald-100 text-emerald-800',Completed:'bg-blue-100 text-blue-800',Recruiting:'bg-mint text-primary',Suspended:'bg-amber-100 text-amber-800',Terminated:'bg-red-100 text-red-700',Severe:'bg-red-100 text-red-700',Moderate:'bg-amber-100 text-amber-800',Missed:'bg-red-100 text-red-700',Pending:'bg-amber-100 text-amber-800'}[v]||'bg-slate-100 text-slate-700';return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{v}</span>};
export function DataTable({columns,rows,actions}){return <div className="overflow-x-auto"><table className="w-full"><thead><tr>{columns.map(c=><th key={c[0]} className="th">{c[0]}</th>)}{actions&&<th className="th"/>}</tr></thead><tbody>
 {rows.map(r=><tr key={r._id} className="hover:bg-bg">{columns.map(([h,k])=>{const v=typeof k==='function'?k(r):get(r,k);return <td key={h} className="td">{['status','severity','reviewStatus'].includes(k)?<Badge v={v}/>:fmt(v)}</td>})}{actions&&<td className="td text-right whitespace-nowrap">{actions(r)}</td>}</tr>)}</tbody></table>
 {!rows.length&&<p className="text-center text-slate-400 py-10 text-sm">No records found.</p>}</div>}
export default function ResourcePage({cfg,extra,linkTitle}){const {user}=useAuth();const [sp]=useSearchParams();
 const [rows,setRows]=useState([]),[meta,setMeta]=useState({page:1,pages:1,total:0}),[page,setPage]=useState(1),[q,setQ]=useState(sp.get('q')||''),[flt,setFlt]=useState({}),[loading,setLoading]=useState(true),[msg,setMsg]=useState(null),[edit,setEdit]=useState(null),[opts,setOpts]=useState({});
 const canWrite=(cfg.write||['admin','researcher']).includes(user.role);const {register,handleSubmit,reset}=useForm();
 const toast=(t,ok=true)=>{setMsg({t,ok});setTimeout(()=>setMsg(null),3500)};
 const load=useCallback(()=>{setLoading(true);api.get('/'+cfg.path,{params:{page,q,...flt}}).then(r=>{setRows(r.data.data);setMeta(r.data)}).catch(e=>toast(errMsg(e),false)).finally(()=>setLoading(false))},[cfg.path,page,q,flt]);
 useEffect(load,[load]);useEffect(()=>{setPage(1)},[q,flt]);
 useEffect(()=>{cfg.fields.filter(f=>f.type==='ref').forEach(f=>api.get('/'+f.ref,{params:{limit:200}}).then(r=>setOpts(o=>({...o,[f.ref]:r.data.data}))).catch(()=>{}))},[cfg]);
 const open=row=>{const v={};if(row)cfg.fields.forEach(f=>{const x=row[f.name];v[f.name]=f.type==='ref'?x?._id||x:f.type==='date'&&x?x.slice(0,10):x});reset(row?v:Object.fromEntries(cfg.fields.map(f=>[f.name,f.type==='bool'?false:''])));setEdit(row||{})};
 const save=async d=>{const body={};for(const f of cfg.fields){const v=d[f.name];if(v===''||(typeof v==='number'&&isNaN(v)))continue;body[f.name]=v}
  try{edit._id?await api.put(`/${cfg.path}/${edit._id}`,body):await api.post('/'+cfg.path,body);toast('Saved successfully');setEdit(null);load()}catch(e){toast(errMsg(e),false)}};
 const del=async r=>{if(!confirm('Delete this record?'))return;try{await api.delete(`/${cfg.path}/${r._id}`);toast('Deleted');load()}catch(e){toast(errMsg(e),false)}};
 return <div className="space-y-4">
  <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-xl font-bold">{cfg.title}</h1><div className="flex gap-2">
   {cfg.report&&['admin','researcher','monitor'].includes(user.role)&&<><button className="btn-o" onClick={()=>download(`/reports/${cfg.report}?format=csv`,cfg.report+'.csv')}><Download size={14}/>CSV</button><button className="btn-o" onClick={()=>download(`/reports/${cfg.report}?format=pdf`,cfg.report+'.pdf')}><Download size={14}/>PDF</button></>}
   {canWrite&&<button className="btn" onClick={()=>open()}><Plus size={16}/>Add</button>}</div></div>
  {msg&&<div className={`rounded-xl px-4 py-2 text-sm ${msg.ok?'bg-mint text-primary':'bg-red-50 text-red-700'}`}>{msg.t}</div>}
  <div className="card"><div className="flex flex-wrap gap-2 mb-3">
   <div className="relative"><Search size={14} className="absolute left-3 top-3 text-slate-400"/><input className="input pl-8 w-56" placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)}/></div>
   {Object.entries(cfg.filters||{}).map(([k,o])=><select key={k} className="input w-44" onChange={e=>setFlt(f=>({...f,[k]:e.target.value}))}><option value="">All {k}</option>{o.map(x=><option key={x}>{x}</option>)}</select>)}</div>
   {loading?<p className="py-10 text-center text-slate-400">Loading...</p>:<DataTable columns={cfg.columns} rows={rows} actions={r=><>{linkTitle&&linkTitle(r)}{canWrite&&<button className="p-1 hover:text-primary" onClick={()=>open(r)}><Pencil size={15}/></button>}{canWrite&&<button className="p-1 hover:text-red-600" onClick={()=>del(r)}><Trash2 size={15}/></button>}</>}/>}
   <div className="flex items-center justify-between pt-3 text-sm text-slate-500"><span>{meta.total} records</span><div className="flex gap-2 items-center"><button className="btn-o" disabled={page<=1} onClick={()=>setPage(page-1)}>Prev</button>{page}/{meta.pages}<button className="btn-o" disabled={page>=meta.pages} onClick={()=>setPage(page+1)}>Next</button></div></div></div>
  {extra&&extra(rows)}
  {edit&&<div className="fixed inset-0 bg-navy/40 z-50 flex items-center justify-center p-4"><form onSubmit={handleSubmit(save)} className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
   <div className="flex justify-between mb-4"><h2 className="font-bold">{edit._id?'Edit':'Add'} record</h2><button type="button" onClick={()=>setEdit(null)}><X/></button></div>
   <div className="grid sm:grid-cols-2 gap-3">{cfg.fields.map(f=><label key={f.name} className={`text-sm ${f.type==='textarea'?'sm:col-span-2':''}`}><span className="text-slate-600">{f.label}</span>
    {f.type==='select'?<select className="input" {...register(f.name)}><option value="">-</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>
    :f.type==='ref'?<select className="input" {...register(f.name)}><option value="">Select...</option>{(opts[f.ref]||[]).map(o=><option key={o._id} value={o._id}>{lbl(f.ref,o)}</option>)}</select>
    :f.type==='textarea'?<textarea rows={2} className="input" {...register(f.name)}/>
    :f.type==='bool'?<input type="checkbox" className="ml-2" {...register(f.name)}/>
    :<input type={f.type} step="any" className="input" {...register(f.name,f.type==='number'?{valueAsNumber:true}:{})}/>}</label>)}</div>
   <div className="flex justify-end gap-2 mt-5"><button type="button" className="btn-o" onClick={()=>setEdit(null)}>Cancel</button><button className="btn">Save</button></div></form></div>}
 </div>}
