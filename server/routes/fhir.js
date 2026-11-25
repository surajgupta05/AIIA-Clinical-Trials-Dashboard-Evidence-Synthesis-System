// Simplified FHIR R4-inspired mapping for demonstration. Not a certified implementation.
const r=require('express').Router();const M=require('../models');const {auth,allow}=require('../middleware/auth');r.use(auth,allow('admin','researcher','monitor'));
const d=x=>x?new Date(x).toISOString().slice(0,10):undefined;
const MAP={Patient:[M.Patient,p=>({resourceType:'Patient',id:String(p._id),identifier:[{value:p.code}],name:[{text:p.name}],gender:(p.sex||'unknown').toLowerCase()})],
 ResearchStudy:[M.ClinicalTrial,t=>({resourceType:'ResearchStudy',id:String(t._id),title:t.title,status:{Recruiting:'active',Active:'active',Completed:'completed',Suspended:'administratively-completed',Terminated:'terminated'}[t.status],phase:{text:t.phase},identifier:[{value:t.ctri}]})],
 ResearchSubject:[M.Enrollment,e=>({resourceType:'ResearchSubject',id:String(e._id),status:e.status==='Dropped'?'withdrawn':e.status==='Completed'?'completed':'on-study',study:{reference:'ResearchStudy/'+e.trial},individual:{reference:'Patient/'+e.patient}})],
 Observation:[M.ClinicalOutcome,o=>({resourceType:'Observation',id:String(o._id),status:'final',code:{text:o.measurement},subject:{reference:'Patient/'+o.patient},effectiveDateTime:d(o.date),valueQuantity:{value:o.followup,unit:o.unit}})],
 MedicationAdministration:[M.Treatment,t=>({resourceType:'MedicationAdministration',id:String(t._id),status:'completed',medicationCodeableConcept:{text:t.medicine},subject:{reference:'Patient/'+t.patient},dosage:{dose:{value:t.dosage,unit:t.unit},route:{text:t.route}}})],
 AdverseEvent:[M.AdverseEvent,a=>({resourceType:'AdverseEvent',id:String(a._id),actuality:'actual',event:{text:a.description},subject:{reference:'Patient/'+a.patient},date:d(a.eventDate),seriousness:{text:a.serious?'Serious':'Non-serious'},severity:{text:a.severity}})]};
r.get('/export/:type',async(req,res,next)=>{try{const m=MAP[req.params.type];if(!m)return res.status(404).json({message:'Unsupported resource'});
 const docs=await m[0].find().limit(50).lean();res.json({resourceType:'Bundle',type:'collection',total:docs.length,entry:docs.map(x=>({resource:m[1](x)}))})}catch(e){next(e)}});
const REQ={Patient:['name','gender'],ResearchStudy:['title','status'],ResearchSubject:['status','study','individual'],Observation:['code','status'],MedicationAdministration:['medicationCodeableConcept','subject'],AdverseEvent:['event','subject']};
r.post('/import',(req,res)=>{const b=req.body;if(b?.resourceType!=='Bundle'||!Array.isArray(b.entry))return res.status(400).json({message:'Expected a FHIR Bundle with entry[]'});
 const results=b.entry.map((e,i)=>{const x=e.resource||{},need=REQ[x.resourceType];if(!need)return{index:i,valid:false,errors:['Unsupported resourceType']};const miss=need.filter(k=>x[k]==null);return{index:i,type:x.resourceType,valid:!miss.length,errors:miss.map(k=>'Missing required field: '+k)}});
 res.json({validated:results.length,valid:results.filter(x=>x.valid).length,results})});
module.exports=r;
