document.getElementById('f').addEventListener('submit',function(e){
e.preventDefault();
var g=function(i){return document.getElementById(i)},ok=true;
['nome','tel'].forEach(function(i){
var el=g(i),v=el.value.trim(),bad=!v||(i==='tel'&&v.replace(/\D/g,'').length<10);
el.parentNode.classList.toggle('bad',bad);if(bad)ok=false});
if(!ok)return;
var t='Olá, Little Paws! Meu nome é '+g('nome').value.trim()+'.\n'
+(g('pet').value.trim()?'Pet: '+g('pet').value.trim()+'\n':'')
+'Assunto: '+g('ass').value+'\n'
+(g('msg').value.trim()?'Mensagem: '+g('msg').value.trim()+'\n':'')
+'Meu telefone: '+g('tel').value.trim();
window.open('https://wa.me/5588996705305?text='+encodeURIComponent(t),'_blank','noopener');
});

/* chat */
(function(){
var WA='https://wa.me/5588996705305';
var INFO='Você é o assistente virtual da Little Paws, consultório veterinário e pet shop em Acopiara/CE. Fatos confirmados: endereço Av. Pedro Alves de Oliveira, nº 422, Acopiara/CE; WhatsApp (88) 9 9670-5305; Instagram @littlepaws; a loja é nova na cidade. O site apresenta estes serviços e produtos: consultas veterinárias, banho e higiene, rações e alimentos, acessórios e brinquedos. A marca é acolhedora, confiável e alegre. REGRAS: responda em português do Brasil, com tom simpático, em no máximo 3 frases curtas. Nunca invente horários, preços, promoções, nomes de veterinários, disponibilidade de produtos ou datas; se não souber, diga que a equipe confirma pelo WhatsApp (88) 9 9670-5305. Para agendar consultas ou banho, oriente a chamar no WhatsApp ou usar o formulário do site. Não faça diagnósticos nem indique remédios ou doses; para sintomas, oriente uma consulta e, se parecer grave, que chame a clínica no WhatsApp o quanto antes. Responda apenas sobre a Little Paws e cuidados gerais com pets.';
var box=document.getElementById('chat'),btn=document.getElementById('chatBtn'),msgs=document.getElementById('msgs'),inp=document.getElementById('cin'),send=document.getElementById('csend'),qs=document.getElementById('qs');
var busy=false,sample=null,tried=false,KEY='lp_convs',cur=null,convs=[];
var histBox=document.getElementById('histList'),histBtn=document.getElementById('histBtn');
try{convs=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){convs=[]}
function save(){try{localStorage.setItem(KEY,JSON.stringify(convs.slice(0,20)))}catch(e){}}
function greet(){add('bot','Oi! Eu sou o assistente da Little Paws. Como posso ajudar você e o seu pet?')}
function showChat(){histBox.hidden=true;msgs.hidden=false;qs.style.display=(cur&&cur.msgs.length)?'none':''}
function resetView(){cur=null;msgs.innerHTML='';showChat()}
function openConv(c){cur=c;msgs.innerHTML='';c.msgs.forEach(function(m){add(m.r==='Cliente'?'me':'bot',m.t)});showChat();inp.focus()}
function renderHist(){
histBox.innerHTML='';
var n=document.createElement('button');n.type='button';n.className='nb';n.textContent='+ Nova conversa';
n.onclick=function(){resetView();greet()};histBox.appendChild(n);
if(!convs.length){var e=document.createElement('p');e.className='em';e.textContent='Nenhuma conversa salva ainda.';histBox.appendChild(e)}
convs.forEach(function(c){
var row=document.createElement('div');row.className='hr';
var o=document.createElement('button');o.type='button';o.className='ho';
var first=c.msgs.length?c.msgs[0].t:'Conversa';
var s=document.createElement('b');s.textContent=first.length>42?first.slice(0,42)+'…':first;
var dt=document.createElement('small');dt.textContent=new Date(c.ts).toLocaleString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
o.appendChild(s);o.appendChild(dt);o.onclick=function(){openConv(c)};
var x=document.createElement('button');x.type='button';x.className='hx';x.setAttribute('aria-label','Apagar conversa');x.textContent='×';
x.onclick=function(){convs=convs.filter(function(k){return k!==c});if(cur===c){cur=null;msgs.innerHTML='';greet()}save();renderHist()};
row.appendChild(o);row.appendChild(x);histBox.appendChild(row)})}
histBtn.onclick=function(){if(histBox.hidden){renderHist();histBox.hidden=false;msgs.hidden=true;qs.style.display='none'}else{showChat()}};
function add(cls,txt){var d=document.createElement('div');d.className='m '+cls;d.textContent=txt;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d}
function fallback(d){d.textContent='Não consegui responder agora. Fale com a equipe pelo WhatsApp: ';var a=document.createElement('a');a.href=WA;a.target='_blank';a.rel='noopener';a.textContent='(88) 9 9670-5305';d.appendChild(a)}
function toggle(o){if(!o)resetView();box.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);if(o){if(!msgs.children.length)greet();inp.focus()}}
btn.onclick=function(){toggle(!box.classList.contains('open'))};
document.getElementById('chatX').onclick=function(){toggle(false);btn.focus()};
async function ask(text){
text=text.trim();if(!text||busy)return;
busy=true;send.disabled=true;inp.value='';showChat();
var conv=cur;if(!conv){conv={id:Date.now(),ts:Date.now(),msgs:[]};cur=conv;convs.unshift(conv)}
var h=conv.msgs;qs.style.display='none';
add('me',text);h.push({r:'Cliente',t:text});conv.ts=Date.now();save();
var d=add('bot','Digitando…');
try{
if(!sample&&!tried){tried=true;sample=(window.claude&&claude.use)?await claude.use('sample'):null}
if(!sample){fallback(d);return}
var convo=h.slice(-12).map(function(x){return x.r+': '+x.t}).join('\n');
var res=await sample(INFO+'\n\nConversa até agora:\n'+convo+'\n\nEscreva apenas a próxima resposta do Assistente.',{cache:false,modelTier:'quick',onText:function(o){d.textContent=o.text;msgs.scrollTop=msgs.scrollHeight}});
d.textContent=res.text;h.push({r:'Assistente',t:res.text});conv.ts=Date.now();save();
}catch(e){if(e&&e.code==='not_granted'){sample=null}fallback(d)}
finally{busy=false;send.disabled=false;inp.focus()}
}
send.onclick=function(){ask(inp.value)};
inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();ask(inp.value)}});
Array.prototype.forEach.call(qs.querySelectorAll('button'),function(b){b.onclick=function(){ask(b.textContent)}});
})();

(function(){
var form=document.getElementById('cad'),box=document.getElementById('pets'),addB=document.getElementById('addPet'),MAX=3,next=1;
function chips(nm,n,o){return '<div class="chips" role="radiogroup">'+o.map(function(x){return '<label><input type="radio" name="'+nm+n+'" value="'+x+'"><span>'+x+'</span></label>'}).join('')+'</div>'}
function g(t,nm,n,o){return '<div class="f"><div class="lg">'+t+'</div>'+chips(nm,n,o)+'</div>'}
function mk(){
var n=next++,d=document.createElement('fieldset');d.className='pet';d.dataset.n=n;
d.innerHTML='<legend></legend>'
+'<div class="row"><div class="f"><label for="pn'+n+'">Nome do pet</label><input id="pn'+n+'" data-k="nome"><div class="err">Informe o nome do pet.</div></div>'
+'<div class="f"><label for="pr'+n+'">Raça</label><input id="pr'+n+'" data-k="raca" placeholder="Ou sem raça definida"></div></div>'
+'<div class="f" data-g="esp"><div class="lg">Espécie</div>'+chips('esp',n,['Cachorro','Gato','Outro'])+'<div class="err">Escolha a espécie.</div></div>'
+'<div class="row">'+g('Sexo','sex',n,['Macho','Fêmea'])+'<div class="f"><label for="pi'+n+'">Idade</label><input id="pi'+n+'" data-k="idade" placeholder="Ex.: 3 anos ou 8 meses"></div></div>'
+g('Porte','por',n,['Pequeno','Médio','Grande'])
+g('Castrado','cas',n,['Sim','Não','Não sei'])
+g('Vacinas em dia','vac',n,['Sim','Não','Não sei'])
+g('Temperamento','tem',n,['Calmo','Agitado','Tem medo','Pode morder'])
+'<div class="f"><label for="ps'+n+'">Alergias, doenças ou remédios</label><textarea id="ps'+n+'" data-k="saude" style="min-height:70px" placeholder="Se não houver, deixe em branco"></textarea></div>'
+'<button type="button" class="lnk rm">Remover este pet</button>';
d.querySelector('.rm').onclick=function(){d.remove();fix()};
box.appendChild(d);fix();
}
function fix(){
var a=box.querySelectorAll('.pet');
Array.prototype.forEach.call(a,function(d,i){d.querySelector('legend').textContent='Sobre o seu pet'+(a.length>1?' '+(i+1):'');d.querySelector('.rm').hidden=a.length<2});
addB.hidden=a.length>=MAX;
}
addB.onclick=function(){if(box.querySelectorAll('.pet').length<MAX)mk()};
mk();
function cv(d,nm){var r=d.querySelector('input[name='+nm+d.dataset.n+']:checked');return r?r.value:''}
function pv(d,k){return d.querySelector('[data-k='+k+']').value.trim()}
function mark(el,bad){var f=el.closest('.f');f.classList.toggle('bad',bad);return bad}
form.addEventListener('submit',function(e){
e.preventDefault();
var bads=[],$=function(i){return document.getElementById(i)};
if(mark($('cn'),!$('cn').value.trim()))bads.push($('cn'));
if(mark($('cw'),$('cw').value.replace(/\D/g,'').length<10))bads.push($('cw'));
var ps=box.querySelectorAll('.pet');
Array.prototype.forEach.call(ps,function(d){
var nm=d.querySelector('[data-k=nome]');if(mark(nm,!nm.value.trim()))bads.push(nm);
var eg=d.querySelector('[data-g=esp] input');if(mark(eg,!cv(d,'esp')))bads.push(eg);
});
if(mark($('ck'),!$('ck').checked))bads.push($('ck'));
if(bads.length){bads[0].focus();return}
var L=['*Cadastro Little Paws*','','*Tutor*','Nome: '+$('cn').value.trim(),'WhatsApp: '+$('cw').value.trim()];
function opt(l,v){if(v)L.push(l+': '+v)}
opt('E-mail',$('ce').value.trim());opt('Bairro/cidade',$('cb').value.trim());opt('Como conheceu',$('cc').value);
Array.prototype.forEach.call(ps,function(d,i){
L.push('','*Pet '+(i+1)+'*','Nome: '+pv(d,'nome'),'Espécie: '+cv(d,'esp'));
opt('Raça',pv(d,'raca'));opt('Sexo',cv(d,'sex'));opt('Idade',pv(d,'idade'));opt('Porte',cv(d,'por'));opt('Castrado',cv(d,'cas'));opt('Vacinas em dia',cv(d,'vac'));opt('Temperamento',cv(d,'tem'));opt('Alergias/doenças/remédios',pv(d,'saude'));
});
L.push('','Autorizo o uso destes dados para atendimento.');
window.open('https://wa.me/5588996705305?text='+encodeURIComponent(L.join('\n')),'_blank','noopener');
});
})();
