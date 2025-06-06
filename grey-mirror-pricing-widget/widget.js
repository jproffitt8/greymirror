(function($){
    const services = {
        'gbp_opt': {name:'GBP Optimization', pillar:'local', dep:[], discountable:true, loc:true, base:[600,0,0], monthly:300},
        'cit_base': {name:'Citation Building (Base)', pillar:'local', dep:[], discountable:true, loc:true, base:[200,0,0], monthly:100},
        'cit_plus': {name:'Citation Building (Plus)', pillar:'local', dep:['cit_base'], discountable:true, loc:true, base:[100,100,0], monthly:100},
        'web_dev': {name:'Web Dev w/ SEO', pillar:'web', dep:[], discountable:true, loc:false, pages:true, base:[2500,0,0], monthly:150},
        'backlink': {name:'Backlink Strategy', pillar:'web', dep:[], discountable:false, loc:false, base:[1000,1000,500], monthly:1500},
        'review': {name:'Review Engineering', pillar:'conv', dep:[], discountable:true, loc:false, base:[300,0,0], monthly:200},
        'calls': {name:'Calls for Review', pillar:'conv', dep:['review'], discountable:false, loc:false, base:[100,0,0], monthly:700},
        'community': {name:'Community Seeding', pillar:'conv', dep:[], discountable:true, loc:false, base:[250,150,100], monthly:500},
        'entity': {name:'Entity & Schema Alignment', pillar:'ai', dep:[], discountable:true, loc:false, base:[300,150,0], monthly:400},
        'answers': {name:'Conversational Answer Eng.', pillar:'ai', dep:[], discountable:true, loc:false, base:[250,250,0], monthly:350},
        'prompt': {name:'Prompt & Model Feedback', pillar:'ai', dep:[], discountable:true, loc:false, base:[250,250,0], monthly:300}
    };

    const baseQuestions = [
        {id:'local', text:'Do you want your practice to be the very first thing patients see on Google Maps and in near-me searches?', add:['gbp_opt','cit_base','cit_plus'], follow:'locations'},
        {id:'web', text:'Is your website outdated or failing to turn visitors into patients?', add:['web_dev'], follow:'pages'},
        {text:'Do you need to boost your site\'s authority with quality backlinks?', add:['backlink']},
        {text:'Are you struggling to consistently get fresh 5-star patient reviews?', add:['review']},
        {text:'Would you go the extra mile by calling patients to get feedback and reviews?', add:['calls']},
        {text:'Do you want to build buzz in local online communities around your practice?', add:['community']},
        {text:'Do you want your practice to be visible in AI-driven search results and voice assistants?', add:['entity','answers','prompt']}
    ];

    const followQuestions = {
        locations:{type:'options',key:'locs', text:'How many physical locations do you have?', options:[
            {t:'1-2 locations', v:2},
            {t:'3-4 locations', v:4},
            {t:'4+ locations', v:5}
        ]},
        pages:{type:'options',key:'pages', text:'What size do you want your new website to be?', options:[
            {t:'Small (\u226450 pages)', v:50},
            {t:'Medium (51-100 pages)', v:100},
            {t:'Large (101-150 pages)', v:150}
        ]}
    };

    function enforceDeps(selected){
        if(selected.has('cit_plus')) selected.add('cit_base');
        if(selected.has('calls')) selected.add('review');
        if(!selected.has('review')) selected.delete('calls');
        if(!selected.has('cit_base')) selected.delete('cit_plus');
    }

    function calcPrices(selected, locs, pages, discount){
        const per50extra = Math.max(0, Math.ceil((pages-50)/50));
        let result = {months:[0,0,0,0], breakdown:[{}, {}, {}, {}]};
        selected.forEach(s => {
            const svc = services[s];
            const mult = svc.loc ? locs : 1;
            let base = svc.base.slice();
            if(s === 'web_dev' && pages>50){
                base[0] += 1000*per50extra;
            }
            for(let i=0;i<3;i++){
                const cost = base[i]*mult;
                result.months[i]+=cost;
                result.breakdown[i][svc.name]=cost;
            }
            const m = svc.monthly*mult;
            result.months[3]+=m;
            result.breakdown[3][svc.name]=m;
        });
        // apply discount
        selected.forEach(s => {
            const svc = services[s];
            if(discount!=='none' && (discount==='reverse' || svc.discountable)){
                for(let i=0;i<4;i++){
                    let cost = result.breakdown[i][svc.name];
                    if(typeof cost==='number'){
                        if(discount==='reverse') cost*=1.2;
                        else cost*= (svc.discountable ? (discount==='super'?0.85:0.80) : 1);
                        result.breakdown[i][svc.name]=Math.round(cost);
                    }
                }
            }
        });
        // recompute totals
        result.months=[0,0,0,0];
        for(let i=0;i<4;i++){
            for(let k in result.breakdown[i]){
                result.months[i]+=result.breakdown[i][k];
            }
        }
        return result;
    }

    function summaryText(selected){
        let parts=[];
        if(selected.has('gbp_opt')||selected.has('cit_base')||selected.has('cit_plus')){
            parts.push('improve your visibility on Google Maps');
        }
        if(selected.has('web_dev')){
            parts.push('modernize your website to convert visitors');
        }
        if(selected.has('backlink')){
            parts.push('increase your search authority');
        }
        if(selected.has('review')||selected.has('calls')){
            parts.push('generate more 5-star reviews');
        }
        if(selected.has('community')){
            parts.push('create buzz in local online communities');
        }
        if(selected.has('entity')||selected.has('answers')||selected.has('prompt')){
            parts.push('stand out in AI search results');
        }
        if(parts.length===0) return '';
        if(parts.length===1) return 'You want to '+parts[0]+'.';
        const last=parts.pop();
        return 'You want to '+parts.join(', ')+', and '+last+'.';
    }

    $(function(){
        const root = $('#gm-pricing-calculator');
        const quiz = root.find('.gm-quiz');
        const manual = root.find('.gm-manual');
        const inputs = root.find('.gm-inputs');
        const results = root.find('.gm-results');
        const questionEl = quiz.find('.gm-question');
        const optionsEl = quiz.find('.gm-options');
        let questions = baseQuestions.slice();
        const selected = new Set();
        let qIndex = 0;
        let locs = 1;
        let pages = 50;

        function showQuestion(){
            if(qIndex>=questions.length){
                quiz.hide();
                inputs.show();
                return;
            }
            const q = questions[qIndex];
            questionEl.text(q.text);
            optionsEl.empty();
            if(q.type==='options'){
                q.options.forEach(opt=>{
                    $('<button class="gm-choice"></button>').text(opt.t).appendTo(optionsEl).on('click',function(e){
                        e.preventDefault();
                        if(q.key==='locs') locs=opt.v;
                        if(q.key==='pages') pages=opt.v;
                        qIndex++; showQuestion();
                    });
                });
            } else {
                $('<button class="gm-yes">Yes</button>').appendTo(optionsEl).on('click',function(e){
                    e.preventDefault();
                    if(q.add) q.add.forEach(s=>selected.add(s));
                    if(q.follow){
                        questions.splice(qIndex+1,0,followQuestions[q.follow]);
                    }
                    qIndex++; showQuestion();
                });
                $('<button class="gm-no">No</button>').appendTo(optionsEl).on('click',function(e){
                    e.preventDefault();
                    qIndex++; showQuestion();
                });
            }
        }
        showQuestion();

        root.find('input[name="gm_flow"]').on('change', function(){
            questions = baseQuestions.slice();
            qIndex = 0;
            selected.clear();
            locs = 1; pages = 50;
            results.hide();
            if(this.value==='manual'){
                quiz.hide();
                manual.show();
                inputs.hide();
                buildManual();
            } else {
                quiz.show();
                manual.hide();
                inputs.hide();
                showQuestion();
            }
        });

        function buildManual(){
            const form = manual.find('.gm-service-list');
            form.empty();
            for(let key in services){
                const svc=services[key];
                const row=$('<label class="gm-service-item"></label>').text(' '+svc.name);
                const chk=$('<input type="checkbox">').attr('value',key);
                row.prepend(chk);
                form.append(row);
            }
        }

        function askFollow(q, callback){
            const fq = followQuestions[q];
            questionEl.text(fq.text);
            optionsEl.empty();
            fq.options.forEach(opt=>{
                $('<button class="gm-choice"></button>').text(opt.t).appendTo(optionsEl).on('click',function(e){
                    e.preventDefault();
                    if(fq.key==='locs') locs=opt.v;
                    if(fq.key==='pages') pages=opt.v;
                    callback();
                });
            });
            quiz.show();
            manual.hide();
            inputs.hide();
        }

        manual.find('.gm-manual-next').on('click', function(e){
            e.preventDefault();
            selected.clear();
            manual.find('input[type="checkbox"]:checked').each(function(){
                selected.add(this.value);
            });
            enforceDeps(selected);

            const needLoc = Array.from(selected).some(s=>services[s].loc);
            const needPages = selected.has('web_dev');

            function showInputs(){
                inputs.show();
                quiz.hide();
            }

            if(needLoc){
                askFollow('locations', function(){
                    if(needPages){
                        askFollow('pages', showInputs);
                    } else {
                        showInputs();
                    }
                });
            } else if(needPages){
                askFollow('pages', showInputs);
            } else {
                showInputs();
            }
        });

        root.find('.gm-calc').on('click', function(e){
            e.preventDefault();
            const discount = $('#gm-discount').val();
            enforceDeps(selected);
            const res = calcPrices(selected, locs, pages, discount);
            const summary = summaryText(selected);
            results.show();
            results.find('.gm-summary').text('Summary: '+summary);
            const wrap = $('<div class="gm-months"></div>');
            ['1','2','3','4+'].forEach((m,i)=>{
                const month = $('<div class="gm-month"></div>').append('<div class="gm-total">$'+res.months[i].toFixed(0)+'</div>').appendTo(wrap);
                month.prepend('<div class="gm-label">Month '+m+'</div>');
                const list=$('<ul class="gm-month-details"></ul>');
                for(let k in res.breakdown[i]){
                    list.append('<li>'+k+': $'+res.breakdown[i][k].toFixed(0)+'</li>');
                }
                month.append(list);
            });
            results.find('.gm-table').empty().append(wrap);
        });
    });
})(jQuery);
