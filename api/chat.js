export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'OPENAI_API_KEY manquante'});
  try{
    const {message,memory='',tasks=[],history=[],skills=[],project=null}=req.body||{};
    if(!message)return res.status(400).json({error:'Message manquant'});
    const safeHistory=Array.isArray(history)?history.slice(-12).map(m=>({role:m.role==='user'?'user':'assistant',content:String(m.value||'').slice(0,2000)})):[];
    const safeSkills=Array.isArray(skills)?skills.slice(0,20).map(String):[];
    let projectContext='Aucun projet joint.';
    if(project&&typeof project==='object'){
      const files=project.files&&typeof project.files==='object'?project.files:{};
      projectContext=`Projet: ${String(project.name||'Projet sans nom').slice(0,120)}\n`+Object.entries(files).slice(0,20).map(([name,content])=>`\n--- ${String(name).slice(0,120)} ---\n${String(content).slice(0,8000)}`).join('\n');
    }
    const context=`Mémoire structurée locale:\n${String(memory).slice(0,3000)}\n\nTâches:\n${JSON.stringify(tasks).slice(0,5000)}\n\nSkills disponibles:\n${safeSkills.join(', ')}\n\nProjet Studio joint:\n${projectContext}`;
    const developer=`Tu es X-Carl, une assistante IA personnelle et un copilote de développement logiciel. Réponds en français sauf si l’utilisateur demande une autre langue. Tu peux aider à concevoir, expliquer, corriger, refactoriser et tester conceptuellement du code. Quand un projet est joint, analyse ses fichiers comme un ensemble cohérent et référence les noms de fichiers concernés. Si l’utilisateur demande une modification, propose clairement le contenu à remplacer ou ajouter; ne prétends jamais avoir modifié le projet tant que le navigateur ne l’a pas appliqué. Pour Python, SQL et les langages non exécutés par le navigateur, fournis du code et une méthode de test appropriée sans prétendre l’avoir exécuté. Privilégie sécurité, accessibilité et maintenabilité. N’invente jamais un accès externe, une exécution ou un résultat.\n\n${context}`;
    const input=[{role:'developer',content:developer},...safeHistory,{role:'user',content:String(message).slice(0,4000)}];
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:'gpt-5.6-luna',input})});
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({error:data.error?.message||'Erreur API'});
    return res.status(200).json({reply:data.output_text||'Réponse vide.'});
  }catch(error){return res.status(500).json({error:'Erreur serveur'});}
}
