const express=require('express');const {auth,allow}=require('../middleware/auth');const {AuditLog}=require('../models');
const ALL=['admin','researcher','monitor','viewer'];
const filterOf=(Model,query)=>{const f={};for(const k in query)if(Model.schema.paths[k]&&query[k]!=='')f[k]=query[k];return f};
const crud=(Model,o={})=>{const r=express.Router();r.use(auth);
 const rd=allow(...(o.read||ALL)),wr=allow(...(o.write||['admin','researcher']));
 const log=(req,action,d)=>AuditLog.create({user:req.user._id,action,resource:Model.modelName,resourceId:d._id}).catch(()=>{});
 r.get('/',rd,async(req,res,next)=>{try{const {page=1,limit=10,q,sort='-createdAt'}=req.query;const f=filterOf(Model,req.query);
  if(q&&o.search){const re=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');f.$or=o.search.map(k=>({[k]:re}))}
  let qr=Model.find(f).sort(sort).skip((page-1)*limit).limit(+limit);if(o.populate)qr=qr.populate(o.populate);
  const [data,total]=await Promise.all([qr,Model.countDocuments(f)]);res.json({data,total,page:+page,pages:Math.ceil(total/limit)||1})}catch(e){next(e)}});
 r.get('/:id',rd,async(req,res,next)=>{try{let q=Model.findById(req.params.id);if(o.populate)q=q.populate(o.populate);const d=await q;d?res.json(d):res.status(404).json({message:'Not found'})}catch(e){next(e)}});
 r.post('/',wr,async(req,res,next)=>{try{const d=await Model.create(req.body);log(req,'create',d);o.after&&await o.after(d,'create');res.status(201).json(d)}catch(e){next(e)}});
 r.put('/:id',wr,async(req,res,next)=>{try{const d=await Model.findById(req.params.id);if(!d)return res.status(404).json({message:'Not found'});d.set(req.body);await d.save();log(req,'update',d);o.after&&await o.after(d,'update');res.json(d)}catch(e){next(e)}});
 r.delete('/:id',allow('admin','researcher'),async(req,res,next)=>{try{const d=await Model.findByIdAndDelete(req.params.id);if(!d)return res.status(404).json({message:'Not found'});log(req,'delete',d);o.after&&await o.after(d,'delete');res.json({ok:true})}catch(e){next(e)}});
 return r};
crud.filterOf=filterOf;module.exports=crud;
