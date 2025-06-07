(function(){
  const cfg = window.gmQuizData || {};
  const wrap = document.querySelector('.gm-quiz');
  if(!wrap) return;
  const bar = wrap.querySelector('.gm-quiz__bar');
  const intro = wrap.querySelector('.gm-quiz__intro');
  const result = wrap.querySelector('.gm-quiz__result');
  const pillarsBox = result.querySelector('.gm-quiz__pillars');
  const form = result.querySelector('.gm-quiz__email');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let step = 0;
  const answers = {};
  const triggeredSubs = new Set();

  function createQuestion(q){
    const s = document.createElement('section');
    s.className='gm-quiz__question';
    s.dataset.step=q.id;
    s.innerHTML=`<p>${q.text}</p>
      <label><input type="radio" name="${q.id}" value="yes">Yes</label>
      <label><input type="radio" name="${q.id}" value="no" checked>No</label>
      <button class="gm-quiz__primary">Next</button>`;
    s.hidden=true;
    s.querySelector('button').addEventListener('click',()=>next(s,q));
    result.before(s);
  }

  function showSection(sec){
    wrap.querySelectorAll('section[data-step]').forEach(el=>el.hidden=true);
    if(sec){
      sec.hidden=false;
      if(!reduce){
        sec.style.opacity=0;
        sec.style.transform='translateY(10px)';
        requestAnimationFrame(()=>{
          sec.style.transition='opacity .15s,transform .15s';
          sec.style.opacity=1;sec.style.transform='translateY(0)';
        });
      }
    }
  }

  function next(section,q){
    const val=section.querySelector('input:checked').value;
    answers[q.id]=val==='yes';
    if(answers[q.id]) q.subs.forEach(s=>triggeredSubs.add(s));
    step++;
    bar.style.width=(step/cfg.questions.length)*100+'%';
    if(step>cfg.questions.length){
      computeResults();
    }else{
      const nxt=wrap.querySelector(`section[data-step="${cfg.questions[step-1].id}"]`);
      showSection(nxt);
    }
  }

  function computeResults(){
    const pillarIds=[...new Set([...triggeredSubs].map(s=>cfg.subToPillar[s]))];
    pillarIds.forEach(pid=>{
      const p=cfg.pillars[pid];
      const btn=document.createElement('button');
      btn.className='gm-quiz__pillar';
      btn.setAttribute('aria-expanded','false');
      btn.innerHTML=`<a href="${p.url}" target="_blank">${p.name}</a>`;
      const list=document.createElement('ul');
      p.services.forEach(s=>{
        if(triggeredSubs.has(s)){
          const li=document.createElement('li');
          li.textContent=s;list.appendChild(li);
        }
      });
      list.hidden=true;btn.appendChild(list);
      btn.addEventListener('click',()=>{
        const open=btn.getAttribute('aria-expanded')==='true';
        btn.setAttribute('aria-expanded',!open);
        list.hidden=open;
      });
      pillarsBox.appendChild(btn);
    });
    if(!pillarIds.length){
      form.hidden=true;
      result.querySelector('.gm-quiz__fallback').hidden=false;
    }
    showSection(result);
  }

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=form.querySelector('input[type=email]').value;
    const body={email,answers,pillars:[...triggeredSubs]};
    try{
      await fetch(cfg.restUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      window.gtag&&gtag('event','quiz_complete',{yesCount:Object.values(answers).filter(Boolean).length,pillars:[...triggeredSubs]});
      form.hidden=true;result.querySelector('.gm-quiz__thanks').hidden=false;
    }catch(err){
      form.hidden=true;result.querySelector('.gm-quiz__thanks').hidden=false;
    }
  });

  intro.querySelector('[data-step="start"]').addEventListener('click',()=>{
    step=1;intro.hidden=true;
    const sec=wrap.querySelector(`section[data-step="${cfg.questions[0].id}"]`);
    showSection(sec);
  });

  cfg.questions.forEach(createQuestion);
})();
