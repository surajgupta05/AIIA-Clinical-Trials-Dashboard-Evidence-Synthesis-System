const r=require('express').Router();const M=require('../models');const {auth}=require('../middleware/auth');r.use(auth);
const monthly=(Model,f)=>Model.aggregate([{$group:{_id:{$dateToString:{format:'%Y-%m',date:'$'+f}},count:{$sum:1}}},{$sort:{_id:1}}]).then(a=>a.map(x=>({month:x._id,count:x.count})));
const grp=(Model,f)=>Model.aggregate([{$group:{_id:'$'+f,value:{$sum:1}}}]).then(a=>a.map(x=>({name:x._id||'Unspecified',value:x.value})));
r.get('/dashboard',async(req,res,next)=>{try{
 const [trials,ae,fu,pendingAE,enrollMonthly,aeMonthly,trialStatus,treatments,aeSeverity,stages,activities,dropped,totalEnr]=await Promise.all([
  M.ClinicalTrial.find().lean(),M.AdverseEvent.countDocuments(),M.FollowUp.countDocuments({status:'Scheduled'}),M.AdverseEvent.countDocuments({reviewStatus:{$in:['Pending','Under Review']}}),
  monthly(M.Enrollment,'date'),monthly(M.AdverseEvent,'eventDate'),grp(M.ClinicalTrial,'status'),grp(M.Treatment,'category'),grp(M.AdverseEvent,'severity'),grp(M.EvidenceStudy,'stage'),
  M.AuditLog.find().sort('-createdAt').limit(8).populate('user','name').lean(),M.Enrollment.countDocuments({status:'Dropped'}),M.Enrollment.countDocuments()]);
 const target=trials.reduce((s,t)=>s+t.targetSize,0),enr=trials.reduce((s,t)=>s+t.enrolled,0);const st=n=>stages.find(s=>s.name===n)?.value||0;
 const total=stages.reduce((s,x)=>s+x.value,0),incl=st('Included'),full=st('Full-text assessed')+incl,screened=full+st('Screened')+st('Excluded');
 res.json({cards:{totalTrials:trials.length,activeTrials:trials.filter(t=>t.status==='Active').length,completedTrials:trials.filter(t=>t.status==='Completed').length,totalEnrolled:enr,scheduledFollowups:fu,adverseEvents:ae,enrollmentProgress:target?Math.round(enr/target*100):0,pendingReviews:pendingAE,dropoutRate:totalEnr?Math.round(dropped/totalEnr*100):0},
  enrollMonthly,aeMonthly,trialStatus,treatments,aeSeverity,prisma:{identified:total,screened,fullText:full,included:incl},
  performance:trials.map(t=>({name:t.title.slice(0,18),target:t.targetSize,enrolled:t.enrolled,remaining:Math.max(0,t.targetSize-t.enrolled)})),activities})}catch(e){next(e)}});
module.exports=r;
