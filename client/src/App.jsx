import {Routes,Route,Navigate} from 'react-router-dom';import {useAuth} from './context/Auth';import Layout from './pages/Layout';import {Login,Register} from './pages/AuthPages';
import ResourcePage from './components/ResourcePage';import {CFG} from './config';import Dashboard from './pages/Dashboard';import {Analytics,Reports} from './pages/Analytics';import TrialDetail from './pages/TrialDetail';import {DataStandards,Users,Notifications,Settings} from './pages/Misc';
import {Link} from 'react-router-dom';import {Eye} from 'lucide-react';import {ResponsiveContainer,LineChart,Line,XAxis,YAxis,Tooltip,CartesianGrid,Legend} from 'recharts';
const Guard=({children})=>{const {user,loading}=useAuth();return loading?<p className="p-10">Loading...</p>:user?children:<Navigate to="/login"/>};
const R=(k,extra,linkTitle)=><ResourcePage cfg={CFG[k]} extra={extra} linkTitle={linkTitle}/>;
const outcomeChart=rows=><div className="card"><h3 className="font-semibold mb-2">Baseline vs follow-up (recorded values, current page)</h3><div className="h-64"><ResponsiveContainer><LineChart data={rows.map(r=>({name:r.patient?.code,baseline:r.baseline,followup:r.followup}))}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Line dataKey="baseline" stroke="#142B3B"/><Line dataKey="followup" stroke="#087F5B"/></LineChart></ResponsiveContainer></div></div>;
export default function App(){return <Routes>
 <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
 <Route element={<Guard><Layout/></Guard>}>
  <Route path="/" element={<Dashboard/>}/>
  <Route path="/trials" element={R('trials',null,r=><Link className="p-1 inline-block hover:text-primary" to={'/trials/'+r._id}><Eye size={15}/></Link>)}/>
  <Route path="/trials/:id" element={<TrialDetail/>}/>
  <Route path="/patients" element={R('patients')}/><Route path="/enrollment" element={R('enrollments')}/><Route path="/treatments" element={R('treatments')}/>
  <Route path="/followups" element={R('followups')}/><Route path="/outcomes" element={R('outcomes',outcomeChart)}/><Route path="/adverse-events" element={R('adverse')}/>
  <Route path="/evidence" element={R('evidence')}/><Route path="/analytics" element={<Analytics/>}/><Route path="/reports" element={<Reports/>}/>
  <Route path="/standards" element={<DataStandards/>}/><Route path="/users" element={<Users/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/settings" element={<Settings/>}/>
 </Route></Routes>}
