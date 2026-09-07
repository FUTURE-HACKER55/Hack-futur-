export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'OPENAI_API_KEY manquante'});
  try{
    const {message,memory='',tasks=[],history=[]}=req.body||{};
    if(!message)return res.status(400).json({error:'Message manquant'});
    const safeHistory=Array.isArray(history)?history.slice(-12).map(m=>({role:m.role==='user'?'user':'assistant',content:String(m.value||'').slice(0,2000)})):[];
    const context=`Mémoire structurée locale:\n${String(memory).slice(0,3000)}\n\nTâches:\n${JSON.stringify(tasks).slice(0,5000)}`;
    const input=[{role:'developer',content:`Tu es Future Assistant, une assistante personnelle claire, utile et respectueuse. Réponds en français sauf si l’utilisateur demande une autre langue. Utilise le contexte fourni uniquement pour aider l’utilisateur. Ne prétends jamais avoir effectué une action que tu n’as pas réellement effectuée.\n\n${context}`},...safeHistory,{role:'user',content:String(message).slice(0,4000)}];
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:'gpt-5.6-luna',input})});
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({error:data.error?.message||'Erreur API'});
    return res.status(200).json({reply:data.output_text||'Réponse vide.'});
  }catch(error){return res.status(500).json({error:'Erreur serveur'});}
}
