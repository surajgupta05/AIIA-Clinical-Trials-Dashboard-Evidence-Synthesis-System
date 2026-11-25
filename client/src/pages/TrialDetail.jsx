import {useEffect,useState} from 'react';import {useParams,Link} from 'react-router-dom';import api,{download} from '../api';import {CFG} from '../config';import {DataTable,fmt,Badge} from '../components/ResourcePage';
const TABS={Participants:'patients',Treatment:'treatments','Follow-ups':'followups',Outcomes:'outcomes',Safety:'adverse'};
export default function TrialDetail(){const {id}=useParams();const [t,setT]=useState(null),[tab,setTab]=useState('Overview'),[rows,setRows]=useState([]);
 useEffect(()=>{api.get('/trials/'+id).then(r=>setT(r.data))},[id]);
 useEffect(()=>{const k=TABS[tab];if(k)api.get('/'+CFG[k].path,{params:{trial:id,limit:100}}).then(r=>setRows(r.data.data)).catch(()=>setRows([]))},[tab,id]);
 if(!t)return <p>Loading...</p>;const pct=Math.round(t.enrolled/t.targetSize*100);
 return <div className="space-y-4"><Link to="/trials" className="text-sm text-primary">← Back to trials</Link><div className="card"><div className="flex justify-between flex-wrap gap-2"><h1 className="text-xl font-bold">{t.title}</h1><Badge v={t.status}/></div><p className="text-sm text-slate-500">{t.ctri} · {t.institution} · PI: {t.pi}</p>
  <div className="mt-3 h-2 bg-slate-100 rounded-full"><div className="h-2 bg-primary rounded-full" style={{width:Math.min(pct,100)+'%'}}/></div><p className="text-xs mt-1">{t.enrolled}/{t.targetSize} enrolled ({pct}%)</p></div>
  <div className="flex gap-2 flex-wrap">{['Overview',...Object.keys(TABS),'Reports'].map(x=><button key={x} onClick={()=>setTab(x)} className={tab===x?'btn':'btn-o'}>{x}</button>)}</div>
  <div className="card">{tab==='Overview'&&<dl className="grid sm:grid-cols-2 gap-3 text-sm">{CFG.trials.fields.map(f=><div key={f.name}><dt className="text-slate-500">{f.label}</dt><dd>{fmt(t[f.name])||'-'}</dd></div>)}</dl>}
   {TABS[tab]&&<DataTable columns={CFG[TABS[tab]].columns} rows={rows}/>}
   {tab==='Reports'&&<div className="flex gap-2 flex-wrap">{[['enrollment','Enrollment'],['followups','Follow-up'],['adverse-events','Adverse events']].map(([k,l])=><button key={k} className="btn-o" onClick={()=>download(`/reports/${k}?format=pdf&trial=${id}`,k+'.pdf')}>{l} PDF</button>)}</div>}</div></div>}
