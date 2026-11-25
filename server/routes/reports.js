const r=require('express').Router();const PDF=require('pdfkit');const M=require('../models');const {auth,allow}=require('../middleware/auth');const {filterOf}=require('../utils/crud');r.use(auth);
const C={trials:[M.ClinicalTrial,['title','ctri','institution','pi','phase','category','status','targetSize','enrolled'],''],
 patients:[M.Patient,['code','name','age','sex','status','consent','trial'],'trial'],enrollment:[M.Enrollment,['patient','trial','date','status'],'patient trial'],
 followups:[M.FollowUp,['patient','trial','visitNumber','visitDate','status','nextDate'],'patient trial'],'adverse-events':[M.AdverseEvent,['patient','trial','description','eventDate','severity','serious','reviewStatus'],'patient trial'],
 evidence:[M.EvidenceStudy,['title','author','year','category','design','sampleSize','stage'],'']};
const val=v=>v==null?'':v instanceof Date?v.toISOString().slice(0,10):typeof v==='object'?(v.title||v.name||v.code||''):String(v);
r.get('/:name',allow('admin','researcher','monitor'),async(req,res,next)=>{try{const c=C[req.params.name];if(!c)return res.status(404).json({message:'Unknown report'});
 const [Model,cols,pop]=c;const f=filterOf(Model,req.query);if(req.query.from||req.query.to)f.createdAt={...(req.query.from&&{$gte:new Date(req.query.from)}),...(req.query.to&&{$lte:new Date(req.query.to)})};
 let q=Model.find(f).sort('-createdAt');if(pop)q=q.populate(pop);const rows=(await q.lean()).map(d=>cols.map(k=>val(d[k])));
 if(req.query.format==='pdf'){const d=new PDF({margin:40,size:'A4',layout:'landscape'});res.setHeader('Content-Type','application/pdf');d.pipe(res);
  d.fontSize(16).text(`AIIA Report: ${req.params.name} (demo data)`);d.fontSize(8).text(`Generated ${new Date().toISOString().slice(0,10)} - ${rows.length} records`).moveDown();
  d.font('Helvetica-Bold').text(cols.join(' | '));d.font('Helvetica');rows.forEach(x=>d.text(x.join(' | '),{lineGap:2}));return d.end()}
 const esc=s=>`"${String(s).replace(/"/g,'""')}"`;res.setHeader('Content-Type','text/csv');res.send([cols,...rows].map(x=>x.map(esc).join(',')).join('\n'))}catch(e){next(e)}});
module.exports=r;
