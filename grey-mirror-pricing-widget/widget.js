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

    const questions = [
        {text:'Do you want your practice to be the very first thing patients see on Google Maps and in near-me searches?', add:['gbp_opt','cit_base','cit_plus']},
        {text:'Is your website outdated or failing to turn visitors into patients?', add:['web_dev']},
        {text:'Do you need to boost your site\'s authority with quality backlinks?', add:['backlink']},
        {text:'Are you struggling to consistently get fresh 5-star patient reviews?', add:['review']},
        {text:'Would you go the extra mile by calling patients to get feedback and reviews?', add:['calls']},
        {text:'Do you want to build buzz in local online communities around your practice?', add:['community']},
        {text:'Do you want your practice to be visible in AI-driven search results and voice assistants?', add:['entity','answers','prompt']}
    ];

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
        let factor = 1;
        if(discount==='super') factor=0.85;
        else if(discount==='dirt') factor=0.80;
        else if(discount==='reverse') factor=1.20;
        selected.forEach(s => {
            const svc = services[s];
            const allowed = (discount==='reverse') || (svc.discountable);
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
        const map=new Map([
            ['gbp_opt','improve your visibility on Google Maps'],
            ['cit_base',''],['cit_plus',''],
            ['web_dev','modernize your website to convert visitors'],
            ['backlink','increase your search authority'],
            ['review','generate more 5-star reviews'],
            ['calls','personally reach out to patients for feedback'],
            ['community','create buzz in local online communities'],
            ['entity','stand out in AI search results'],
            ['answers',''],['prompt','']
        ]);
        let parts=[];
        selected.forEach(s=>{if(map.get(s)) parts.push(map.get(s));});
        if(!parts.length) return '';
        return 'You want to '+parts.join(', ') + '.';
    }

    $(function(){
        const root = $('#gm-pricing-calculator');
        const quiz = root.find('.gm-quiz');
        const manual = root.find('.gm-manual');
        const inputs = root.find('.gm-inputs');
        const results = root.find('.gm-results');
        const questionEl = quiz.find('.gm-question');
        const selected = new Set();
        let qIndex = 0;

        function showQuestion(){
            if(qIndex>=questions.length){
                quiz.hide();
                inputs.show();
                return;
            }
            questionEl.text(questions[qIndex].text);
        }
        showQuestion();

        quiz.find('.gm-yes').on('click', function(e){
            e.preventDefault();
            questions[qIndex].add.forEach(s=>selected.add(s));
            qIndex++;
            showQuestion();
        });
        quiz.find('.gm-no').on('click', function(e){
            e.preventDefault();
            qIndex++;
            showQuestion();
        });

        root.find('input[name="gm_flow"]').on('change', function(){
            if(this.value==='manual'){
                quiz.hide();
                manual.show();
                inputs.hide();
                results.hide();
                buildManual();
            } else {
                quiz.show();
                manual.hide();
                inputs.hide();
                results.hide();
                qIndex=0; selected.clear();
                showQuestion();
            }
        });

        function buildManual(){
            const form = manual.find('.gm-service-list');
            form.empty();
            for(let key in services){
                const svc=services[key];
                const label=$('<label></label>').text(' '+svc.name);
                const chk=$('<input type="checkbox">').attr('value',key);
                label.prepend(chk);
                form.append(label).append('<br>');
            }
        }

        manual.find('.gm-manual-next').on('click', function(e){
            e.preventDefault();
            selected.clear();
            manual.find('input[type="checkbox"]:checked').each(function(){
                selected.add(this.value);
            });
            enforceDeps(selected);
            inputs.show();
        });

        root.find('.gm-calc').on('click', function(e){
            e.preventDefault();
            const locs = parseInt($('#gm-locations').val())||1;
            const pages = parseInt($('#gm-pages').val())||50;
            const discount = $('#gm-discount').val();
            enforceDeps(selected);
            const res = calcPrices(selected, locs, pages, discount);
            const summary = summaryText(selected);
            results.show();
            results.find('.gm-summary').text('Summary: '+summary);
            const table = $('<table></table>');
            const header = $('<tr><th>Month</th><th>Total</th></tr>');
            table.append(header);
            ['1','2','3','4+'].forEach((m,i)=>{
                const row=$('<tr></tr>');
                row.append('<td>Month '+m+'</td>');
                row.append('<td>$'+res.months[i].toFixed(0)+'</td>');
                const breakdown = res.breakdown[i];
                const details=$('<ul></ul>');
                for(let k in breakdown){
                    details.append('<li>'+k+': $'+breakdown[k].toFixed(0)+'</li>');
                }
                row.append($('<td></td>').append(details));
                table.append(row);
            });
            results.find('.gm-table').empty().append(table);
        });
    });
})(jQuery);
