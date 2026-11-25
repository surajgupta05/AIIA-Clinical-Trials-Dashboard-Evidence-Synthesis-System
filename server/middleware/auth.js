const jwt=require('jsonwebtoken');const {User}=require('../models');
exports.auth=async(req,res,next)=>{try{const t=(req.headers.authorization||'').replace('Bearer ','');
 const {id}=jwt.verify(t,process.env.JWT_SECRET);req.user=await User.findById(id);if(!req.user)throw 0;next();}
 catch{res.status(401).json({message:'Not authenticated'})}};
exports.allow=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'Access denied for your role'});
