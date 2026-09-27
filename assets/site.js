/* =====================================================================
   CoPlanAI site · shared runtime · 23 September 2026
   - injects the SAME header and footer into every page
     (<div data-site-header></div> · <div data-site-footer></div>)
   - injects the SAME closing invitation into every page that asks for it
     (<div data-site-invite></div>, above the footer; see FOUNDATION.md §5)
   - marks the active nav item from <body data-page="…">
   - the six type presets: ?type=<key> · localStorage · <html data-type>
   - the Type switcher (bottom-left)
   - helpers: SITE.bind() (data-m from data/matrix.js), SITE.applyPoles(),
     SITE.caseUrl(slug), SITE.liveUrl(slug) (null when no live page), SITE.venn (the Venn
     texts, SITE-BRIEF §9), SITE.fixCases() (shared title/place fixes), SITE.reduceMotion,
     SITE.ready(fn)
   Include once per page, after data/matrix.js (if used) and before the
   page's own script. See FOUNDATION.md.
   ===================================================================== */
(function(){
  'use strict';

  var doc=document, root=doc.documentElement;
  var STORE='coplan-type';
  var DEFAULT='commons-full';
  /* Public release: <meta name="coplan:release" content="public"> fixes the default preset and hides the Type tools. */
  var PUBLIC=!!doc.querySelector('meta[name="coplan:release"][content="public"]');
  var MAIL='info@coplanai.com';

  var PRESETS=[
    {key:'commons',            name:'Commons, as 31',        stack:'Newsreader Light · Founders Grotesk Text · Archivo Narrow'},
    {key:'commons-full',       name:'Commons, fuller',       stack:'Newsreader · Founders Grotesk · Archivo Narrow', note:'default'},
    {key:'founders-news-jb',   name:'Founders display',      stack:'Founders Grotesk Medium · Newsreader italic · JetBrains Mono'},
    {key:'news-founders-jb',   name:'Newsreader display',    stack:'Newsreader · Founders Grotesk Text · JetBrains Mono'},
    {key:'condensed',          name:'Condensed display',     stack:'Founders Grotesk Condensed · Founders Text · JetBrains Mono'},
    {key:'founders-serifbody', name:'Serif reading',         stack:'Founders Grotesk Semibold · Newsreader text · IBM Plex Mono'}
  ];

  var NAV=[
    {key:'use-cases',    href:'use-cases.html',    label:'Use cases',    gloss:'Where the work has been done'},
    {key:'signals',      href:'signals.html',      label:'Signals',      gloss:'Media, research and news'},
    {key:'use-coplanai', href:'use-coplanai.html', label:'Use CoPlanAI', gloss:'Ways to work together'},
    {key:'mission',      href:'mission.html',      label:'Mission',      gloss:'Why we plan together'},
    {key:'about',        href:'about.html',        label:'About',        gloss:'People, company, ethics'}
  ];
  var START=[
    {href:'mailto:'+MAIL,    label:'Get in touch'},
    {href:'use-cases.html',  label:'See the use cases'},
    {href:'mission.html',    label:'Read the mission'}
  ];

  /* The five ways to work with us, in ascending commitment (BRIEF §11, Use CoPlanAI). `key` is the
     section id on use-coplanai.html; `words` is the reader's side of it, for the invitation's doors. */
  var WAYS=[
    {key:'subscriber', name:'Subscriber',                mode:'Self-service',          words:'Run your own workshops on the platform.'},
    {key:'capacity',   name:'Capacity Builder',          mode:'Guided launch',         words:'Learn the method, then run it yourselves.'},
    {key:'innovation', name:'Innovation Partner',        mode:'Co-creation',           words:'Start a research or innovation project with us.'},
    {key:'governance', name:'Governance Transformation', mode:'Strategic partnership', words:'Change how your institution decides.'},
    {key:'multiplier', name:'Multiplier Programme',      mode:'Train the trainers',    words:'Train your staff to train others.'}
  ];

  /* The closing invitation (SITE-BRIEF R1.1: invite-study version 08 "Commons wash", reworked).
     One text for every page. `question` marks its accent word with *asterisks*. */
  var INVITE={
    question:'Planning a change, or teaching how to plan *together*?',
    line:'Tell us about the place and the people, and we will suggest where to start.',
    write:'Write to us',
    subject:'A first conversation',
    body:['Hello,','','The place:','','The people:','',''].join('\r\n'),
    waysLabel:'Five ways to work with us'
  };

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function byKey(k){for(var i=0;i<PRESETS.length;i++){if(PRESETS[i].key===k)return PRESETS[i];}return null;}
  function store(v){try{if(v==null)localStorage.removeItem(STORE);else localStorage.setItem(STORE,v);}catch(e){}}
  function stored(){try{return localStorage.getItem(STORE);}catch(e){return null;}}
  function queryType(){try{return new URLSearchParams(location.search).get('type');}catch(e){return null;}}

  var reduceMotion=false;
  try{reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}

  /* ---------------- type presets ----------------
     Priority: ?type=<key> (persisted) → localStorage → <html data-type> → default.
     The inline bootstrap in each page's <head> does the same before first paint;
     this repeats it so a page without the snippet still behaves. */
  var q=queryType();
  var current=PUBLIC?DEFAULT:(byKey(q)?q:(byKey(stored())?stored():(byKey(root.getAttribute('data-type'))?root.getAttribute('data-type'):DEFAULT)));
  if(!PUBLIC&&byKey(q)) store(q);
  root.setAttribute('data-type',current);

  function setPreset(k,opts){
    if(!byKey(k)) return;
    current=k; root.setAttribute('data-type',k);
    if(!(opts&&opts.persist===false)) store(k);
    syncTypeUI();
    try{doc.dispatchEvent(new CustomEvent('site:type',{detail:{key:k}}));}catch(e){}
  }

  /* ---------------- header ---------------- */
  function page(){return (doc.body&&doc.body.getAttribute('data-page'))||'';}

  function headerHTML(active){
    var links=NAV.map(function(n){return '<li><a href="'+n.href+'"'+(n.key===active?' aria-current="page"':'')+'>'+esc(n.label)+'</a></li>';}).join('');
    var mlinks=NAV.map(function(n){return '<li><a href="'+n.href+'"'+(n.key===active?' aria-current="page"':'')+'><span class="m-name">'+esc(n.label)+'</span><span class="m-gloss">'+esc(n.gloss)+'</span></a></li>';}).join('');
    return ''+
      '<a class="skip" href="#main">Skip to content</a>'+
      '<div class="wrap site-header__bar">'+
        '<a class="brand" href="index.html"'+(active==='home'?' aria-current="page"':'')+' aria-label="CoPlanAI, home"><span class="brand__w">CoPlan</span><span class="brand__ai">AI</span></a>'+
        '<nav class="site-nav" aria-label="Main"><ul>'+links+'</ul></nav>'+
        '<a class="site-header__cta" href="mailto:'+MAIL+'">Get in touch</a>'+
        '<button type="button" class="menu-btn" aria-expanded="false" aria-controls="site-menu"><span class="menu-btn__t">Menu</span><span class="menu-btn__icon" aria-hidden="true"></span></button>'+
      '</div>'+
      '<div class="site-menu" id="site-menu" hidden>'+
        '<div class="wrap site-menu__inner">'+
          '<nav aria-label="Main (menu)"><ul>'+mlinks+'</ul></nav>'+
          '<div class="site-menu__foot">'+
            '<a class="btn" href="mailto:'+MAIL+'">Get in touch</a>'+
            '<p class="lab">'+MAIL+' · Helsinki</p>'+
          '</div>'+
        '</div>'+
      '</div>';
  }

  function mountHeader(){
    var ph=doc.querySelector('[data-site-header]'); if(!ph) return null;
    var h=doc.createElement('header');
    h.className='site-header'; h.id='site-header';
    h.innerHTML=headerHTML(page());
    ph.parentNode.replaceChild(h,ph);

    var btn=h.querySelector('.menu-btn'), menu=h.querySelector('#site-menu');
    var mq=window.matchMedia('(max-width:960px)');
    function focusables(){return [btn].concat(Array.prototype.slice.call(menu.querySelectorAll('a[href],button:not([disabled])')));}
    function isOpen(){return btn.getAttribute('aria-expanded')==='true';}
    function open(){
      menu.hidden=false; btn.setAttribute('aria-expanded','true');
      root.classList.add('menu-open');
      btn.querySelector('.menu-btn__t').textContent='Close';
      var first=menu.querySelector('a[href]'); if(first) first.focus();
      doc.addEventListener('keydown',onKey,true);
    }
    function close(returnFocus){
      if(!isOpen()) return;
      menu.hidden=true; btn.setAttribute('aria-expanded','false');
      root.classList.remove('menu-open');
      btn.querySelector('.menu-btn__t').textContent='Menu';
      doc.removeEventListener('keydown',onKey,true);
      if(returnFocus) btn.focus();
    }
    /* focus trap-lite: Tab cycles between the button and the menu's links; Esc closes */
    function onKey(e){
      if(e.key==='Escape'){e.preventDefault(); close(true); return;}
      if(e.key!=='Tab') return;
      var f=focusables(), first=f[0], last=f[f.length-1], a=doc.activeElement;
      if(f.indexOf(a)<0){e.preventDefault(); first.focus(); return;}
      if(e.shiftKey&&a===first){e.preventDefault(); last.focus();}
      else if(!e.shiftKey&&a===last){e.preventDefault(); first.focus();}
    }
    btn.addEventListener('click',function(){isOpen()?close(true):open();});
    menu.addEventListener('click',function(e){ if(e.target.closest('a')) close(false); });
    var onMQ=function(){ if(!mq.matches) close(false); };
    if(mq.addEventListener) mq.addEventListener('change',onMQ); else if(mq.addListener) mq.addListener(onMQ);

    /* hairline below the header once the page scrolls */
    var ticking=false;
    function onScroll(){ if(ticking) return; ticking=true; requestAnimationFrame(function(){ h.classList.toggle('is-scrolled',(window.scrollY||window.pageYOffset)>4); ticking=false; }); }
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    return h;
  }

  /* ---------------- footer ---------------- */
  function footerHTML(active){
    var ex=NAV.map(function(n){return '<li><a href="'+n.href+'"'+(n.key===active?' aria-current="page"':'')+'>'+esc(n.label)+'</a></li>';}).join('');
    var st=START.map(function(n){return '<li><a href="'+n.href+'">'+esc(n.label)+'</a></li>';}).join('');
    return ''+
      '<div class="wrap">'+
        '<div class="site-footer__top">'+
          '<div class="sf-brand">'+
            '<a class="brand" href="index.html" aria-label="CoPlanAI, home"><span class="brand__w">CoPlan</span><span class="brand__ai">AI</span></a>'+
            '<p class="sf-mission">Collaborative planning: the opportunity to evaluate ideas and scenarios, understand their impact, take an informed decision, <em>and even change your choice.</em></p>'+
          '</div>'+
          '<nav class="sf-col" aria-label="Explore"><p class="lab">Explore</p><ul>'+ex+'</ul></nav>'+
          '<nav class="sf-col" aria-label="Start"><p class="lab">Start</p><ul>'+st+'</ul></nav>'+
        '</div>'+
        '<div class="site-footer__fine">'+
          '<p>A service of <a href="https://spinunit.org" target="_blank" rel="noopener">SPIN Unit Lab Oy<span class="sr"> (opens in a new tab)</span></a> · Mechelininkatu 23, 00100 Helsinki · <a href="mailto:'+MAIL+'">'+MAIL+'</a> · © 2021–2026</p>'+
          (PUBLIC?'':'<p class="sf-type">Type · <button type="button" data-open-type aria-controls="type-pop">'+esc(byKey(current).name)+'</button></p>')+
        '</div>'+
      '</div>';
  }
  function mountFooter(){
    var ph=doc.querySelector('[data-site-footer]'); if(!ph) return null;
    var f=doc.createElement('footer');
    f.className='site-footer'; f.id='site-footer';
    f.innerHTML=footerHTML(page());
    ph.parentNode.replaceChild(f,ph);
    return f;
  }

  /* ---------------- the closing invitation ----------------
     <div data-site-invite></div> becomes <section class="site-invite">: the question, one sentence,
     "Write to us" and the address, then the five ways to work with us as quiet doors into
     use-coplanai.html. Placeholder attributes:
       data-subject="…"   the email subject (default INVITE.subject)
       data-ways="none"   leave out the five doors
       data-question / data-line   a different question or sentence: for invite-study.html only;
                                   pages keep the shared text. *word* sets the accent. */
  var inviteN=0;
  function accent(s){ return esc(s).replace(/\*([^*]+)\*/g,'<em>$1</em>'); }
  function mailto(subject,body){
    var q=[];
    if(subject) q.push('subject='+encodeURIComponent(subject));
    if(body) q.push('body='+encodeURIComponent(body));
    return 'mailto:'+MAIL+(q.length?'?'+q.join('&'):'');
  }
  function waysHref(key){ return (page()==='use-coplanai'?'':'use-coplanai.html')+'#'+key; }
  function inviteHTML(o){
    var n=++inviteN, sfx=n>1?('-'+n):'', hid='site-invite-h'+sfx, wid='site-invite-ways'+sfx;
    var doors='';
    if(o.ways!=='none'){
      doors=
        '<nav class="site-invite__ways" aria-labelledby="'+wid+'">'+
          '<p class="lab site-invite__ways-h" id="'+wid+'">'+esc(INVITE.waysLabel)+'</p>'+
          '<ol class="site-invite__doors">'+WAYS.map(function(w,i){
            var bar=''; for(var k=0;k<WAYS.length;k++) bar+='<i'+(k<=i?' class="f"':'')+'></i>';
            return '<li><a class="site-invite__door" href="'+waysHref(w.key)+'">'+
              '<span class="site-invite__bar" aria-hidden="true">'+bar+'</span>'+
              '<span class="site-invite__name">'+esc(w.name)+'</span>'+
              '<span class="site-invite__words">'+esc(w.words)+'</span>'+
            '</a></li>';
          }).join('')+'</ol>'+
        '</nav>';
    }
    return ''+
      '<div class="wrap">'+
        '<div class="site-invite__head">'+
          '<h2 class="h2 site-invite__q" id="'+hid+'">'+accent(o.question)+'</h2>'+
          '<p class="site-invite__line">'+esc(o.line)+'</p>'+
          '<p class="site-invite__acts">'+
            '<a class="site-invite__write" href="'+esc(mailto(o.subject,INVITE.body))+'">'+esc(INVITE.write)+'<span class="sr"> by email</span></a>'+
            '<a class="site-invite__mail" href="mailto:'+MAIL+'">'+MAIL+'</a>'+
          '</p>'+
        '</div>'+
        doors+
      '</div>';
  }
  function mountInvite(scope){
    var out=[];
    (scope||doc).querySelectorAll('[data-site-invite]').forEach(function(ph){
      var o={
        question:ph.getAttribute('data-question')||INVITE.question,
        line:ph.getAttribute('data-line')||INVITE.line,
        subject:ph.getAttribute('data-subject')||INVITE.subject,
        ways:ph.getAttribute('data-ways')||''
      };
      var s=doc.createElement('section');
      s.className='site-invite';
      s.id=ph.id||(doc.getElementById('invite')?'':'invite');
      if(!s.id) s.removeAttribute('id');
      s.innerHTML=inviteHTML(o);
      s.setAttribute('aria-labelledby',s.querySelector('.site-invite__q').id);
      ph.parentNode.replaceChild(s,ph);
      out.push(s);
    });
    return out;
  }

  /* ---------------- the dock: the Type switcher ---------------- */
  var dock=null, typeBtn=null, pop=null, foundersLocal=null;
  var SAMPLE_TEXT='Evaluate ideas, understand their impact, decide.';
  function dockHTML(){
    var opts=PRESETS.map(function(p){
      return '<label class="type-opt" data-preset="'+p.key+'">'+
        '<input type="radio" name="site-type" value="'+p.key+'"'+(p.key===current?' checked':'')+'>'+
        '<span class="type-opt__name"><span>'+esc(p.name)+(p.note?' <span style="color:var(--ink-4);font-weight:400">· '+esc(p.note)+'</span>':'')+'</span><span class="type-opt__key">'+p.key+'</span></span>'+
        '<span class="type-opt__sample" aria-hidden="true">The mandate to <em>imagine</em>.</span>'+
        '<span class="type-opt__text" aria-hidden="true">'+SAMPLE_TEXT+'</span>'+
        '<span class="type-opt__lab">'+esc(p.stack)+'</span>'+
      '</label>';
    }).join('');
    return ''+
      '<div class="type-pop" id="type-pop" role="dialog" aria-label="Type presets" hidden>'+
        '<fieldset><legend>Type preset<span>Applies to every page and is remembered.</span></legend>'+opts+'</fieldset>'+
        '<p class="type-pop__note" data-founders-note></p>'+
      '</div>'+
      '<div class="dock__row">'+
        '<button type="button" class="type-btn" aria-expanded="false" aria-controls="type-pop"><span class="type-btn__glyph" aria-hidden="true">Aa</span><span class="type-btn__k">Type</span><span class="type-btn__v"></span></button>'+
      '</div>';
  }
  function syncTypeUI(){
    var p=byKey(current); if(!p) return;
    if(dock){
      dock.querySelector('.type-btn__v').textContent=p.name;
      typeBtn.setAttribute('aria-label','Type preset: '+p.name+'. Change');
      dock.querySelectorAll('input[name="site-type"]').forEach(function(i){i.checked=(i.value===current);});
    }
    doc.querySelectorAll('[data-open-type]').forEach(function(b){b.textContent=p.name;});
  }
  function mountDock(){
    if(PUBLIC||doc.querySelector('.dock')) return;
    dock=doc.createElement('div'); dock.className='dock'; dock.innerHTML=dockHTML();
    doc.body.appendChild(dock);
    typeBtn=dock.querySelector('.type-btn'); pop=dock.querySelector('#type-pop');

    function isOpen(){return typeBtn.getAttribute('aria-expanded')==='true';}
    function open(){
      pop.hidden=false; typeBtn.setAttribute('aria-expanded','true');
      var c=pop.querySelector('input:checked')||pop.querySelector('input'); if(c) c.focus();
      doc.addEventListener('keydown',onKey,true); doc.addEventListener('pointerdown',onOutside,true);
    }
    function close(returnFocus){
      if(!isOpen()) return;
      pop.hidden=true; typeBtn.setAttribute('aria-expanded','false');
      doc.removeEventListener('keydown',onKey,true); doc.removeEventListener('pointerdown',onOutside,true);
      if(returnFocus) typeBtn.focus();
    }
    function onKey(e){
      if(e.key==='Escape'){e.preventDefault(); close(true); return;}
      if(e.key==='Enter'&&e.target&&e.target.name==='site-type'){e.preventDefault(); close(true); return;}
      if(e.key==='Tab'){
        /* the group is one tab stop; Tab leaves it back to the button */
        var inPop=pop.contains(doc.activeElement);
        if(inPop){e.preventDefault(); close(true);}
      }
    }
    function onOutside(e){ if(!dock.contains(e.target)) close(false); }
    typeBtn.addEventListener('click',function(){isOpen()?close(true):open();});
    pop.addEventListener('change',function(e){ if(e.target&&e.target.name==='site-type') setPreset(e.target.value); });
    doc.addEventListener('click',function(e){
      var t=e.target.closest&&e.target.closest('[data-open-type]'); if(!t) return;
      e.preventDefault(); open();
    });
    /* phones: the dock steps out of the way while the reader scrolls down, and comes back on the
       way up, at the top, or when it takes focus (review tooling must not sit on the content) */
    var lastY=window.scrollY||window.pageYOffset||0, mqPhone=window.matchMedia('(max-width:640px)');
    window.addEventListener('scroll',function(){
      var y=window.scrollY||window.pageYOffset||0;
      if(!mqPhone.matches||isOpen()){ dock.classList.remove('dock--away'); lastY=y; return; }
      var dy=y-lastY; if(Math.abs(dy)<8) return;
      dock.classList.toggle('dock--away',dy>0&&y>160); lastY=y;
    },{passive:true});
    dock.addEventListener('focusin',function(){ dock.classList.remove('dock--away'); });
    syncTypeUI();
    checkFounders();
  }

  /* Is the local Founders Grotesk present? The Type popover's note says which face is in use. */
  function checkFounders(){
    if(!doc.fonts||!doc.fonts.load) return;
    doc.fonts.load('500 16px "Founders"').then(function(list){
      foundersLocal=!!(list&&list.length);
      var n=dock&&dock.querySelector('[data-founders-note]');
      if(n) n.textContent=foundersLocal?'Founders Grotesk is read from this Mac (local). Publishing needs a Klim web licence.':'Founders Grotesk is not installed here: Schibsted Grotesk stands in.';
      syncTypeUI();
    }).catch(function(){});
  }

  /* ---------------- data helpers ---------------- */
  /* fill every [data-m] from data/matrix.js (no-op without it) */
  function bind(scope){ var C=window.COPLAN; if(C&&C.bind){ C.bind(scope||doc); return true; } return false; }

  /* rewrite the pole and quadrant colour tokens from the data, so a palette change flows through */
  function applyPoles(){
    var C=window.COPLAN; if(!C||!C.data||!C.data.poles||!C.quadrantColours) return false;
    var P=C.data.poles, Q=C.quadrantColours(P), s=root.style;
    ['propose','respond','open','defined'].forEach(function(k){ if(P[k]) s.setProperty('--p-'+k,P[k]); });
    Object.keys(Q).forEach(function(k){
      s.setProperty('--q-'+k,Q[k]);
      if(C.readable) s.setProperty('--qi-'+k,C.readable(Q[k],'#FFFFFF',4.8));
      if(C.mix){ s.setProperty('--qs-'+k,C.mix('#FFFFFF',Q[k],0.34)); s.setProperty('--qt-'+k,C.mix('#FFFFFF',Q[k],0.10)); }
    });
    return true;
  }

  /* case pages stay the live ones. data/case-links.js sets window.CASE_LINKS = {ledgerSlug: liveUrl}
     (a .js twin of data/case-links.json: JSON cannot be fetched from file://).
     Unknown slugs fall back to the live portfolio index rather than a guessed URL. */
  function links(){ var L=window.CASE_LINKS; return (L&&L.links)?L.links:(L||null); }
  function caseUrl(slug){
    var L=links(); if(L&&slug&&L[slug]) return L[slug];
    return 'https://coplanai.com/portfolio/';
  }
  /* the live case page, or null when the case has none yet (then: do not link) */
  function liveUrl(slug){ var L=links(); return (L&&slug&&L[slug])?L[slug]:null; }

  /* Display fixes for titles and places in data/matrix.js, applied once on load so every page
     (the Use cases catalogue, the map tooltips on Home and the map study, Mission's discs) shows
     the same name. Each is flagged to be fixed at the source (see README.md, "Data to fix").
     Sources: the live case pages, reference/case-fact-pack.md, reference/FACT-AUDIT.md §2 and §7. */
  var CASE_TITLES={
    '2023-milan-design-week':'Milano Digital Week',
    '2026-norway':'Åmotsskogen, Gjerdrum',
    '2023-lulea-youth':'Luleå University: participatory AI methods for youth engagement',
    '2024-zamanand-munich':'Re-imagining the car-free city, Munich',
    '2023-lahti-city-centre':'Lahti City Centre Vision 2040',
    '2023-undp-nusantara':'Nusantara Capital City 2023',
    '2025-berlin-kiezlabor':'Kiezlabor 2025',
    '2023-humankind-workshops':'\u2018AI in the Hood\u2019 closing workshop, Humankind',
    '2024-paces-stockholm':'PACES Stockholm',
    '2026-bologna':'TICO \u2013 Officina mobile della conoscenza, Bologna',
    /* moved here from use-cases.html (QA, 24 Sept) so the Home framework and map tooltips agree:
       the title of the case's own live page where the ledger title reads badly */
    '2026-wuf-2026':'Affordable housing and informal settlement upgrading, WUF13 Baku',  /* the one Baku entry (R3.4) */
    '2024-hamburg-hal':'Urban Testbeds Jr, Hamburg',
    '2024-oman-planning-event':'Humanising Cities, Oman',
    '2023-vantaa':'Havukoski Futures, Vantaa',
    '2025-oulu':'Oulu Centre Vision 2040'
  };
  var CASE_PLACES={
    '2026-norway':'Gjerdrum, Norway',
    '2023-ace-children-playgrounds-to-planning':'H\u00e4meenlinna, Finland',
    '2024-kyiv-school-of-economics-lviv':'Kyiv, Ukraine',
    'ai-based-visualisation-for-sustainable-and-affordable-housing':'Online',  /* the January 2026 workshop: no Manila participants */
    '2024-turku-university-nusantara':'East Kalimantan (Nusantara), Indonesia',
    '2024-oman-planning-event':'Muscat, Oman',
    '2025-new-urban-habits-festival':'Bucharest, Romania'
  };
  /* data/places.js (generated) still files the online workshop under Manila. Drop it once, for every map,
     then recolour any city whose list changed. Hidden records (duplicates,
     merged or removed cases) are left out at build time since 24 Sept (map-data/build_web_data.py, which
     also takes Ann Arbor off the map and puts the merged 'AI in the Hood' workshop in Eindhoven); the
     hidden filter below stays as a safety net. */
  var OFF_MAP={'ai-based-visualisation-for-sustainable-and-affordable-housing':1};
  /* empty since 24 Sept (Q&A): 2026-giz is placed in Cairo in data/matrix.js, and the map build colours every
     city of the GIZ cohort with it (map-data/build_web_data.py SITE_CASES); moving it here would undo that */
  var MOVE_TO={};
  var fixed=false;
  function fixCases(){
    var C=window.COPLAN; if(fixed||!C||!C.data||!C.data.cases) return;
    C.data.cases.forEach(function(c){
      if(CASE_TITLES[c.slug]) c.title=CASE_TITLES[c.slug];
      if(CASE_PLACES[c.slug]) c.place=CASE_PLACES[c.slug];
    });
    fixPlaces(C);
    fixed=true;
  }
  function fixPlaces(C){
    var P=window.COPLAN_PLACES; if(!P||!P.forEach) return;
    var BY={}, HID={}; C.data.cases.forEach(function(c){ BY[c.slug]=c; if(c.hidden) HID[c.slug]=1; });
    P.forEach(function(p){
      if(!p||!p.cases) return;
      var was=p.cases.join('|');
      p.cases=p.cases.filter(function(s){ return !HID[s]&&!OFF_MAP[s]&&!(MOVE_TO[s]&&MOVE_TO[s]!==p.place); });
      Object.keys(MOVE_TO).forEach(function(s){ if(MOVE_TO[s]===p.place&&p.cases.indexOf(s)<0) p.cases.push(s); });
      if(p.cases.join('|')===was) return;
      var t={}; p.cases.forEach(function(s){ var c=BY[s]; if(c) t[c.task]=(t[c.task]||0)+1; });
      var best=null; Object.keys(t).forEach(function(k){ if(best===null||t[k]>t[best]||(t[k]===t[best]&&k===p.task)) best=k; });
      p.tasks=t; p.task=best;
    });
  }

  /* The Venn, as Damiano chose it on 23 Sept (SITE-BRIEF §9: "Foresight, overlaps renamed").
     One source for every page that draws it (Home hero, Mission). Verbatim; do not paraphrase.
     c.word is the word drawn in the centre of the diagram (24 Sept: "CoPlan, not Coplanning"); the panel,
     the key and the labels keep c.title. Its colours are the --venn-* tokens in site.css (venn-studies.html). */
  var VENN={
    label:'Coplanning: Stakeholders, Institutions and Foresight with AI overlap; where all three meet is Coplanning.',
    s:{title:'Stakeholders', line:'hold the agency',
       text:'Residents, businesses and visitors: the people who live with the outcome. They bring lived expertise, what they value and what a place is actually for.'},
    i:{title:'Institutions', line:'hold the mandate',
       text:'City offices, planners and funders: the bodies that must decide and deliver. They hold the mandate and set the guardrails every option has to respect.'},
    a:{title:'Foresight', line:'with AI',
       text:'AI turns people\u2019s own words into scenarios of the real place and evaluates each against the institution\u2019s policy, design guides and law, and for likely environmental and social impact. Scenarios, not forecasts: it shows what could happen; people decide what should.'},
    si:{title:'Public interest & governance', stub:['Public interest','& governance'],
       text:'Where lived experience meets the legal mandate: the public enters while the options are still open, not after the plan is fixed, and what it wants is made accountable to those who must govern it.'},
    sa:{title:'Seeing before choosing', stub:['Seeing before','choosing'],
       text:'A resident describes a change to one photograph, sees the scenario and what it would do, and keeps it or changes their mind. We do not know what we want until we see it.'},
    ia:{title:'Checking before committing', stub:['Checking before','committing'],
       text:'Every scenario is evaluated against the institution\u2019s own policy, design guides and law as it is made, so conflicts surface while a change is still easy, long before anything is committed.'},
    c:{title:'Coplanning', line:'where all three meet', word:'CoPlan',
       text:'One process rather than three: the institution holds the mandate and the guardrails, people bring what they know and value, and foresight turns both into scenarios everyone can see, weigh and agree on.'}
  };

  /* the two axis questions, from COPLAN.data.axes: <p class="q" data-ax="vertical|horizontal">fallback</p> */
  function fillAxes(scope){
    var C=window.COPLAN, A=C&&C.data&&C.data.axes; if(!A) return false;
    (scope||doc).querySelectorAll('[data-ax]').forEach(function(el){ var a=A[el.getAttribute('data-ax')]; if(a&&a.question) el.textContent=a.question; });
    return true;
  }

  /* ---------------- boot ---------------- */
  var readyFns=[], booted=false;
  function ready(fn){ if(booted) fn(); else readyFns.push(fn); }
  function boot(){
    if(booted) return;
    fixCases();
    mountHeader(); mountInvite(); mountFooter(); mountDock();
    applyPoles(); bind(doc); fillAxes(doc);
    booted=true;
    readyFns.splice(0).forEach(function(fn){ try{fn();}catch(e){ setTimeout(function(){throw e;}); } });
  }
  if(doc.readyState==='loading') doc.addEventListener('DOMContentLoaded',boot); else boot();

  window.SITE={
    presets:PRESETS.slice(), nav:NAV.slice(),
    get preset(){return current;},
    setPreset:setPreset,
    bind:bind, applyPoles:applyPoles, fillAxes:fillAxes, caseUrl:caseUrl, liveUrl:liveUrl,
    caseTitles:CASE_TITLES, casePlaces:CASE_PLACES, fixCases:fixCases, venn:VENN,
    ways:WAYS.map(function(w){ return {key:w.key,name:w.name,mode:w.mode,words:w.words,href:waysHref(w.key)}; }),
    invite:{question:INVITE.question,line:INVITE.line,subject:INVITE.subject,email:MAIL},
    mountInvite:mountInvite,
    ready:ready, esc:esc,
    reduceMotion:reduceMotion,
    page:page
  };
})();
