export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'OPENAI_API_KEY manquante'});
  try{
    const {message,memory='',tasks=[],history=[],skills=[]}=req.body||{};
    if(!message)return res.status(400).json({error:'Message manquant'});
    const safeHistory=Array.isArray(history)?history.slice(-12).map(m=>({role:m.role==='user'?'user':'assistant',content:String(m.value||'').slice(0,2000)})):[];
    const safeSkills=Array.isArray(skills)?skills.slice(0,20).map(String):[];
    const context=`Mémoire structurée locale:\n${String(memory).slice(0,3000)}\n\nTâches:\n${JSON.stringify(tasks).slice(0,5000)}\n\nSkills disponibles:\n${safeSkills.join(', ')}`;
    const developer=`Tu es X-Carl, une assistante IA personnelle et un copilote de développement logiciel. Réponds en français sauf si l’utilisateur demande une autre langue. Tu peux aider à concevoir, expliquer, corriger, refactoriser et tester conceptuellement du code en Python, JavaScript, HTML/CSS, JSON, SQL et autres langages courants. Quand l’utilisateur demande du code, donne un exemple complet et lisible, explique brièvement les points importants et signale les hypothèses. Pour HTML/CSS/JavaScript, tu peux proposer du code prêt à tester dans le Dev Lab. Pour Python, SQL et les autres langages non exécutés par le navigateur, fournis du code et une méthode de test appropriée sans prétendre l’avoir exécuté. Privilégie les bonnes pratiques, la sécurité, l’accessibilité, la maintenabilité et des solutions adaptées au niveau de l’utilisateur. N’invente jamais une action, un résultat d’exécution, un fichier ou un accès externe que tu n’as pas réellement effectué. Utilise le contexte fourni uniquement pour aider l’utilisateur.\n\n${context}`;
    const input=[{role:'developer',content:developer},...safeHistory,{role:'user',content:String(message).slice(0,4000)}];
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:'gpt-5.6-luna',input})});
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({error:data.error?.message||'Erreur API'});
    return res.status(200).json({reply:data.output_text||'Réponse vide.'});
  }catch(error){return res.status(500).json({error:'Erreur serveur'});}
}
