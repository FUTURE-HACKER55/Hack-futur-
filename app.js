const tasks=JSON.parse(localStorage.getItem('future_tasks')||'[]');
const notes=document.querySelector('#notes');
notes.value=localStorage.getItem('future_notes')||'';
const list=document.querySelector('#taskList');
const count=document.querySelector('#taskCount');
const bar=document.querySelector('#progressBar');
const title=document.querySelector('#progressTitle');
const text=document.querySelector('#progressText');
const messages=document.querySelector('#chatMessages');
const chatInput=document.querySelector('#chatInput');
const aiStatus=document.querySelector('#aiStatus');
const voiceStatus=document.querySelector('#voiceStatus');

function save(){localStorage.setItem('future_tasks',JSON.stringify(tasks));render()}
function render(){
  list.innerHTML='';
  tasks.forEach((t,i)=>{
    const li=document.createElement('li');
    li.className='task '+(t.done?'done':'');
    li.innerHTML=`<input type="checkbox" ${t.done?'checked':''} aria-label="Terminer la tâche"><span class="task-text"></span><span class="priority">${t.priority}</span><button class="delete" aria-label="Supprimer">×</button>`;
    li.querySelector('.task-text').textContent=t.text;
    li.querySelector('input').onchange=()=>{t.done=!t.done;save()};
    li.querySelector('.delete').onclick=()=>{tasks.splice(i,1);save()};
    list.appendChild(li)
  });
  const done=tasks.filter(t=>t.done).length;
  count.textContent=tasks.length;
  const pct=tasks.length?Math.round(done/tasks.length*100):0;
  bar.style.width=pct+'%';
  title.textContent=tasks.length?(pct===100?'Tout est terminé 🎉':`${done}/${tasks.length} tâches terminées`):'Prêt à commencer';
  text.textContent=tasks.length?`${pct}% de progression aujourd’hui.`:'Ajoute ta première tâche.'
}
function addTask(value,priority='normal'){
  const clean=value.trim();
  if(!clean)return false;
  tasks.unshift({text:clean,priority,done:false});
  save();
  return true;
}
function addMessage(role,value){
  const el=document.createElement('div');
  el.className=`message ${role}`;
  el.textContent=value;
  messages.appendChild(el);
  messages.scrollTop=messages.scrollHeight;
}
function localAssistant(input){
  const q=input.trim();
  const lower=q.toLowerCase();
  if(/^(bonjour|salut|hello|bonsoir)/.test(lower))return'Bonjour 👋 Je suis Future Assistant. Je peux gérer tes tâches, tes notes et discuter avec toi.';
  if(lower.includes('montre')&&lower.includes('tâche')){
    if(!tasks.length)return'Tu n’as encore aucune tâche.';
    return tasks.map((t,i)=>`${i+1}. ${t.done?'✅':'⬜'} ${t.text} (${t.priority})`).join('\n');
  }
  if(lower.startsWith('ajoute une tâche')||lower.startsWith('ajoute une tache')){
    const value=q.replace(/^ajoute une t[aâ]che\s*:? */i,'');
    if(addTask(value))return`Tâche ajoutée : ${value}`;
    return'Bien sûr. Écris par exemple : « ajoute une tâche : finir mon prototype ».';
  }
  if(lower.startsWith('note ')||lower.startsWith('note:')){
    const value=q.replace(/^note\s*:? */i,'');
    notes.value=notes.value?`${notes.value}\n${value}`:value;
    localStorage.setItem('future_notes',notes.value);
    return'Note enregistrée dans ta mémoire locale 🧠.';
  }
  if(lower.includes('combien')&&lower.includes('tâche'))return`Tu as ${tasks.length} tâche(s), dont ${tasks.filter(t=>!t.done).length} à faire.`;
  if(lower.includes('mémoire')||lower.includes('memoire'))return notes.value?`Voici ta mémoire locale :\n${notes.value}`:'Ta mémoire locale est encore vide.';
  return null;
}
async function askAI(input){
  const response=localAssistant(input);
  if(response){aiStatus.textContent='Local';addMessage('assistant',response);return}
  aiStatus.textContent='IA…';
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:input,memory:notes.value,tasks})});
    if(!r.ok)throw new Error('API indisponible');
    const data=await r.json();
    addMessage('assistant',data.reply||'Je n’ai pas reçu de réponse.');
    aiStatus.textContent='IA';
  }catch(e){
    aiStatus.textContent='Local';
    addMessage('assistant','Le mode IA n’est pas encore connecté. Les commandes locales restent disponibles. Configure le serveur /api/chat avec une clé API côté serveur.');
  }
}

document.querySelector('#taskForm').onsubmit=e=>{e.preventDefault();const input=document.querySelector('#taskInput');if(addTask(input.value,document.querySelector('#priorityInput').value)){input.value='';input.focus()}};
document.querySelector('#clearDone').onclick=()=>{for(let i=tasks.length-1;i>=0;i--)if(tasks[i].done)tasks.splice(i,1);save()};
document.querySelector('#saveNote').onclick=()=>{localStorage.setItem('future_notes',notes.value);alert('Note sauvegardée.')};
document.querySelector('#chatForm').onsubmit=e=>{e.preventDefault();const value=chatInput.value.trim();if(!value)return;chatInput.value='';addMessage('user',value);askAI(value)};

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SpeechRecognition){
  const recognition=new SpeechRecognition();
  recognition.lang='fr-FR';recognition.interimResults=false;recognition.continuous=false;
  document.querySelector('#voiceButton').onclick=()=>{voiceStatus.textContent='🎙️ Je t’écoute…';recognition.start()};
  recognition.onresult=e=>{chatInput.value=e.results[0][0].transcript;voiceStatus.textContent='Voix reconnue. Envoie la commande.'};
  recognition.onerror=()=>{voiceStatus.textContent='Impossible de reconnaître la voix dans ce navigateur.'};
}else{
  document.querySelector('#voiceButton').disabled=true;
  voiceStatus.textContent='La commande vocale n’est pas prise en charge par ce navigateur.';
}

addMessage('assistant','Bonjour 👋 Je suis ton Future Assistant. Essaie « ajoute une tâche : apprendre JavaScript » ou pose-moi une question.');
render();