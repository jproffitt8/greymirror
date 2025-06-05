(function(){
const root=document.getElementById('gm-price-calculator');
if(!root) return;
const pricing={
  lpo:{gbp:{ret:300,on:600},base:{ret:100,on:200},plus:{ret:100,on:[100,100]}},
  web:{ret:150,on:2500},backlink:{ret:1500,on:[1000,1000,500]},
  review:{ret:200,on:[300]},calls:{ret:700,on:[100]},
  seed:{ret:500,on:[250,150,100]},
  entity:{ret:400,on:[300,150]},answer:{ret:350,on:[250,250]},prompt:{ret:300,on:[250,250]}
};
const questions=[
 {id:'lpo',q:'Show up first on Google Maps?',svc:['lpo']},
 {id:'web',q:'Need a modern website?',svc:['web']},
 {id:'back',q:'Climb higher on Google search?',svc:['backlink']},
 {id:'rev',q:'Collect more 5-star reviews?',svc:['review']},
 {id:'call',q:'Want personal review calls?',svc:['calls']},
 {id:'seed',q:'Spark chatter in local groups?',svc:['seed']},
 {id:'ai',q:'Optimize for AI search?',svc:['entity','answer','prompt']}
];
let step=0,answers={},selected={},pages=50,locs=1;

function $(s){return root.querySelector(s);}
function money(v){return '$'+v.toLocaleString();}
function render(){
 root.innerHTML='';
 const prog=document.createElement('div');
 prog.className='gm-pc-progress';
 prog.style.width=(step/questions.length)*100+'%';
 root.appendChild(prog);
 const card=document.createElement('div');
 card.className='gm-pc-step';
 root.appendChild(card);
 if(step<questions.length){
  const q=questions[step];
  card.innerHTML='<h2>'+q.q+'</h2>'+
  '<button class="gm-pc-btn" id="yes">Yes</button>'+
  '<button class="gm-pc-btn" id="no">No</button>';
  $('#yes').onclick=()=>{answers[q.id]=true;q.svc.forEach(s=>selected[s]=true);step++;render();};
  $('#no').onclick=()=>{answers[q.id]=false;step++;render();};
 }else if(!selected.detail){
  selected.detail=true;
  card.innerHTML='<h2>Project Details</h2>'+
   'Locations:<br><input type="number" id="loc" value="'+locs+'" min="1" style="width:80px"><br><br>'+
   'Website pages:<br><input type="number" id="pg" value="'+pages+'" min="1" style="width:80px"><br><br>'+
   '<button class="gm-pc-btn" id="go">Calculate</button>';
  $('#go').onclick=()=>{locs=parseInt($('#loc').value||1);pages=parseInt($('#pg').value||1);render();};
 }else{
  const months=calc();
  card.innerHTML='<h2>Your Pricing</h2>'+
   '<table class="gm-pc-table"><tr><th></th><th>Month 1</th><th>Month 2</th><th>Month 3</th><th>Month 4+</th></tr>'+
   '<tr><td>Total</td><td>'+money(months[0])+'</td><td>'+money(months[1])+'</td><td>'+money(months[2])+'</td><td>'+money(months[3])+'</td></tr></table>'+
   '<button class="gm-pc-btn" id="reset">Start over</button>';
  $('#reset').onclick=()=>{step=0;answers={};selected={};render();};
 }
}

function calc(){
 const months=[0,0,0,0];
 function add(m,amt){months[m]+=amt;}
 if(selected.lpo){
  const repeat=locs<=2?1:(locs<=4?2:3);
  for(let m=0;m<repeat;m++){add(m,pricing.lpo.gbp.on*locs);add(m,pricing.lpo.base.on*locs);if(m<2)add(m,pricing.lpo.plus.on[m]*locs);}    
  for(let m=0;m<4;m++){add(m,pricing.lpo.gbp.ret*locs);add(m,pricing.lpo.base.ret*locs);add(m,pricing.lpo.plus.ret*locs);}  }
 if(selected.web){
  const blocks=Math.ceil(pages/50);
  for(let m=0;m<blocks&&m<3;m++){add(m,pricing.web.on);}  for(let m=0;m<4;m++){add(m,pricing.web.ret);} }
 if(selected.backlink){add(0,pricing.backlink.on[0]);add(1,pricing.backlink.on[1]);add(2,pricing.backlink.on[2]);for(let m=0;m<4;m++)add(m,pricing.backlink.ret);}
 if(selected.review){add(0,pricing.review.on[0]);for(let m=0;m<4;m++)add(m,pricing.review.ret);}
 if(selected.calls){add(0,pricing.calls.on[0]);for(let m=0;m<4;m++)add(m,pricing.calls.ret);}
 if(selected.seed){add(0,pricing.seed.on[0]);add(1,pricing.seed.on[1]);add(2,pricing.seed.on[2]);for(let m=0;m<4;m++)add(m,pricing.seed.ret);}
 if(selected.entity){add(0,pricing.entity.on[0]);add(1,pricing.entity.on[1]);for(let m=0;m<4;m++)add(m,pricing.entity.ret);}
 if(selected.answer){add(0,pricing.answer.on[0]);add(1,pricing.answer.on[1]);for(let m=0;m<4;m++)add(m,pricing.answer.ret);}
 if(selected.prompt){add(0,pricing.prompt.on[0]);add(1,pricing.prompt.on[1]);for(let m=0;m<4;m++)add(m,pricing.prompt.ret);}
 return months;
}

render();
})();
