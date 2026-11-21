const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-to-a-strong-password';
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID || '1573475987579211806';
const DATA_FILE = path.join(__dirname, 'data.json');
const categories = ['BOTS', 'SERVIDORES', 'SITES', 'DESIGN', 'PRODUTOS LIVRES'];
const initial = { products: [], submissions: [], sales: 0, socials: { Discord: 'https://discord.gg/', Instagram: '', YouTube: '', TikTok: '', WhatsApp: '' }, settings: { storeName: 'MUKA STORE', tagline: 'Seu próximo projeto começa aqui.' } };
function readDb(){ try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return structuredClone(initial); } }
function writeDb(db){ fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)); }
if (!fs.existsSync(DATA_FILE)) writeDb(initial);
app.use(express.json({limit:'2mb'}));
app.use(session({secret:process.env.SESSION_SECRET || 'development-secret-change-me', resave:false, saveUninitialized:false, cookie:{httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', maxAge:1000*60*60*12}}));
app.use(express.static(path.join(__dirname, 'public')));
const adminOnly=(req,res,next)=>req.session.admin?next():res.status(401).json({error:'Faça login como administrador.'});
app.get('/api/store', async (req,res)=>{
 const db=readDb(); let members=null;
 try { const r=await fetch(`https://discord.com/api/guilds/${DISCORD_SERVER_ID}/widget.json`,{signal:AbortSignal.timeout(3500}); if(r.ok){const g=await r.json(); members=g.presence_count ?? g.members?.length ?? null;} } catch {}
 res.json({categories,products:db.products.filter(p=>p.approved!==false),sales:db.sales,members,socials:db.socials,settings:db.settings,discordServerId:DISCORD_SERVER_ID});
});
app.post('/api/submit-product',(req,res)=>{ const {name,description,image,link,owner}=req.body||{}; if(!name||!description||!link)return res.status(400).json({error:'Preencha nome, descrição e link.'}); const db=readDb(); const item={id:Date.now().toString(),name:String(name).slice(0,100),description:String(description).slice(0,1000),image:String(image||'').slice(0,500),link:String(link).slice(0,1000),owner:String(owner||'Comunidade').slice(0,100),category:'PRODUTOS LIVRES',approved:false,createdAt:new Date().toISOString()}; db.submissions.push(item);writeDb(db);res.json({ok:true,message:'Produto enviado para análise!'});});
app.post('/api/login',(req,res)=>{const {username,password}=req.body||{};if(username===ADMIN_USER&&password===ADMIN_PASSWORD){req.session.admin=true;res.json({ok:true});}else res.status(403).json({error:'Usuário ou senha incorretos.'});});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/admin/status',(req,res)=>res.json({logged:!!req.session.admin}));
app.get('/api/admin/data',adminOnly,(req,res)=>res.json(readDb()));
app.post('/api/admin/products',adminOnly,(req,res)=>{const db=readDb();const p=req.body||{};if(!p.name||!categories.includes(p.category))return res.status(400).json({error:'Nome e categoria válidos são obrigatórios.'});db.products.unshift({id:Date.now().toString(),name:String(p.name).slice(0,100),description:String(p.description||'').slice(0,1000),price:String(p.price||''),image:String(p.image||''),link:String(p.link||''),category:p.category,approved:true,featured:!!p.featured});writeDb(db);res.json({ok:true});});
app.put('/api/admin/products/:id',adminOnly,(req,res)=>{const db=readDb();const p=db.products.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:'Produto não encontrado'});Object.assign(p,req.body);writeDb(db);res.json({ok:true});});
app.delete('/api/admin/products/:id',adminOnly,(req,res)=>{const db=readDb();db.products=db.products.filter(p=>p.id!==req.params.id);writeDb(db);res.json({ok:true});});
app.get('/api/admin/submissions',adminOnly,(req,res)=>res.json(readDb().submissions));
app.post('/api/admin/submissions/:id/approve',adminOnly,(req,res)=>{const db=readDb();const s=db.submissions.find(x=>x.id===req.params.id);if(!s)return res.status(404).json({error:'Envio não encontrado'});s.approved=true;db.products.unshift({...s,approved:true,category:'PRODUTOS LIVRES'});db.submissions=db.submissions.filter(x=>x.id!==s.id);writeDb(db);res.json({ok:true});});
app.delete('/api/admin/submissions/:id',adminOnly,(req,res)=>{const db=readDb();db.submissions=db.submissions.filter(x=>x.id!==req.params.id);writeDb(db);res.json({ok:true});});
app.put('/api/admin/settings',adminOnly,(req,res)=>{const db=readDb();db.settings={...db.settings,...req.body.settings};db.socials={...db.socials,...req.body.socials};if(Number.isFinite(Number(req.body.sales)))db.sales=Math.max(0,Math.floor(Number(req.body.sales)));writeDb(db);res.json({ok:true});});
app.post('/api/admin/sale/:id',adminOnly,(req,res)=>{const db=readDb();const p=db.products.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:'Produto não encontrado'});db.sales+=Math.max(1,Math.floor(Number(req.body.quantity)||1));writeDb(db);res.json({ok:true,sales:db.sales});});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`Muka Store online at port ${PORT}`));
