// DEMONSTRATION DATA ONLY - all records are fictional.
require('dotenv').config({path:require('path').join(__dirname,'../../.env')});
const connect=require('../config/db'),M=require('../models');const pw=process.env.SEED_ADMIN_PASSWORD;
const day=n=>new Date(Date.now()-n*864e5),P=(a,i)=>a[i%a.length];
(async()=>{if(!pw)throw new Error('Set SEED_ADMIN_PASSWORD in .env');await connect();for(const k in M)await M[k].deleteMany({});
 const U=(name,email,role)=>M.User.create({name,email,password:pw,role});
 await U('Demo Admin',process.env.SEED_ADMIN_EMAIL||'admin@aiia.demo','admin');
 const rs=[];for(let i=1;i<=5;i++)rs.push(await U('Demo Researcher '+i,`researcher${i}@aiia.demo`,'researcher'));
 await U('Demo Monitor','monitor@aiia.demo','monitor');await U('Demo Viewer','viewer@aiia.demo','viewer');
 const cats=['Rasayana','Panchakarma','Herbal Formulation','Yoga & Lifestyle','Rasa Shastra'],st=['Active','Recruiting','Completed','Active','Suspended'];
 const T=[];for(let i=0;i<5;i++)T.push(await M.ClinicalTrial.create({title:`[DEMO] ${cats[i]} Study ${i+1}`,ctri:`CTRI/DEMO/2025/00${i+1}`,institution:'Demo Ayurveda Institute',pi:'Dr. Demo Investigator '+(i+1),phase:P(['Phase II','Phase III','Observational'],i),studyType:'Interventional',category:cats[i],startDate:day(300),targetSize:40+i*20,status:st[i],inclusion:'Fictional inclusion criteria',exclusion:'Fictional exclusion criteria',description:'Synthetic demonstration trial',primaryOutcome:'Demo primary outcome',secondaryOutcome:'Demo secondary outcome'}));
 const fn=['Asha','Ravi','Meena','Karan','Priya','Sanjay'],ln=['Verma','Rao','Nair','Singh','Das','Iyer'];const Pt=[];
 for(let i=0;i<30;i++){const p=await M.Patient.create({code:'DEMO-'+String(i+1).padStart(3,'0'),name:`${P(fn,i)} ${P(ln,i*2+1)} (demo)`,age:25+i,sex:P(['Female','Male'],i),contact:'demo@example.com',trial:P(T,i)._id,consent:true,enrollmentDate:day(i*9),status:i%10===9?'Dropped':'Enrolled',researcher:P(rs,i).name});Pt.push(p);
  await M.Enrollment.create({patient:p._id,trial:p.trial,date:day(i*9),status:p.status==='Dropped'?'Dropped':'Enrolled'})}
 for(const t of T)await M.ClinicalTrial.findByIdAndUpdate(t._id,{enrolled:await M.Enrollment.countDocuments({trial:t._id,status:{$ne:'Dropped'}})});
 for(let i=0;i<20;i++)await M.Treatment.create({patient:Pt[i]._id,trial:Pt[i].trial,medicine:'Demo Formulation '+P('ABCDE',i),category:P(cats,i),dosage:5+i%4,unit:'g',frequency:'Twice daily',route:'Oral',startDate:day(120-i),researcher:Pt[i].researcher,notes:'Demo record'});
 for(let i=0;i<25;i++)await M.FollowUp.create({patient:Pt[i]._id,trial:Pt[i].trial,visitDate:day(60-i*4),visitNumber:1+i%4,status:P(['Completed','Completed','Scheduled','Missed','Rescheduled'],i),observations:'Demo observation',notes:'Demo note',nextDate:day(30-i)});
 for(let i=0;i<20;i++)await M.ClinicalOutcome.create({patient:Pt[i]._id,trial:Pt[i].trial,type:'Symptom score',measurement:'Demo Symptom Score',baseline:60+i%10,followup:45+i%12,unit:'points',date:day(40-i),comments:'Demo recorded value'});
 for(let i=0;i<10;i++)await M.AdverseEvent.create({patient:Pt[i]._id,trial:Pt[i].trial,description:'Demo adverse event '+(i+1),eventDate:day(100-i*9),onsetDate:day(101-i*9),severity:P(['Mild','Moderate','Severe'],i),serious:i%5===4,expectedness:P(['Expected','Unexpected'],i),outcome:'Recovered',suspectedTreatment:'Demo Formulation A',actionTaken:'Observation',reportedBy:P(rs,i).name,reviewStatus:P(['Pending','Under Review','Reviewed','Closed'],i)});
 for(let i=0;i<15;i++)await M.EvidenceStudy.create({title:`[DEMO] Placeholder Study ${i+1}`,author:'Demo Author',year:2015+i%10,registrationId:'DEMO-REG-'+(i+1),category:P(cats,i),design:P(['RCT','Cohort','Case series'],i),sampleSize:40+i*5,intervention:'Demo intervention',comparator:'Demo comparator',primaryOutcome:'Demo outcome',results:'Placeholder - not real research',limitations:'Fictional entry',stage:P(['Identified','Screened','Full-text assessed','Included','Excluded'],i)});
 await M.Notification.create({message:'Demo data loaded',type:'system'});console.log('Seeded. Admin:',process.env.SEED_ADMIN_EMAIL||'admin@aiia.demo');process.exit()})().catch(e=>{console.error(e);process.exit(1)});
