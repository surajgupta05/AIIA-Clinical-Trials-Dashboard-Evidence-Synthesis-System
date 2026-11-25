import {useEffect,useState} from 'react';import api from '../api';import {ResponsiveContainer,BarChart,Bar,LineChart,Line,PieChart,Pie,Cell,XAxis,YAxis,Tooltip,CartesianGrid,Legend} from 'recharts';
export const COLORS=['#087F5B','#142B3B','#F59F00','#E03131','#74C69D','#5C7C8A'];
export const Chart=({title,children,h='h-64'})=><div className="card"><h3 className="font-semibold mb-2">{title}</h3><div className={h}><ResponsiveContainer>{children}</ResponsiveContainer></div></div>;
export const PieC=({data,donut})=><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={donut?55:0} outerRadius={90} label>{data.map((_,i)=><Cell key={i} fill={COLORS[i%6]}/>)}</Pie><Tooltip/><Legend/></PieChart>;
export const useDash=()=>{const [d,setD]=useState(null);useEffect(()=>{api.get('/analytics/dashboard').then(r=>setD(r.data))},[]);return d};
export default function Dashboard(){const d=useDash();if(!d)return <p>Loading...</p>;const c=d.cards;
 const cards=[['Total Trials',c.totalTrials],['Active Trials',c.activeTrials],['Completed Trials',c.completedTrials],['Enrolled Patients',c.totalEnrolled],['Scheduled Follow-ups',c.scheduledFollowups],['Adverse Events',c.adverseEvents],['Enrollment Progress',c.enrollmentProgress+'%'],['Pending Reviews',c.pendingReviews]];
 return <div className="space-y-5"><div><h1 className="text-xl font-bold">Dashboard</h1><p className="text-xs text-amber-700">Showing synthetic demonstration data. All figures are computed live from MongoDB.</p></div>
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(([l,v])=><div key={l} className="card"><p className="text-xs text-slate-500">{l}</p><p className="text-2xl font-bold text-primary">{v}</p></div>)}</div>
  <div className="grid lg:grid-cols-2 gap-4">
   <Chart title="Patient Enrollment Overview (monthly)"><BarChart data={d.enrollMonthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#087F5B" radius={[6,6,0,0]}/></BarChart></Chart>
   <Chart title="Trial Status Distribution"><PieC data={d.trialStatus}/></Chart>
   <Chart title="Adverse Event Trends"><LineChart data={d.aeMonthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis allowDecimals={false}/><Tooltip/><Line dataKey="count" stroke="#E03131" strokeWidth={2}/></LineChart></Chart>
   <Chart title="Trial Performance: Target vs Enrolled"><BarChart data={d.performance}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Bar dataKey="target" fill="#142B3B"/><Bar dataKey="enrolled" fill="#087F5B"/></BarChart></Chart>
   <Chart title="Treatment Distribution"><PieC data={d.treatments} donut/></Chart>
   <div className="card"><h3 className="font-semibold mb-2">Recent Activities</h3><ul className="text-sm space-y-2">{d.activities.map(a=><li key={a._id} className="flex justify-between border-b border-slate-100 pb-1"><span>{a.user?.name||'System'} {a.action}d {a.resource}</span><span className="text-slate-400">{a.createdAt.slice(0,10)}</span></li>)}{!d.activities.length&&<li className="text-slate-400">No activity yet</li>}</ul></div></div></div>}
