/* CoPlanAI use-cases page -- was shipped base64-encoded inside
   window.eval(decodeURIComponent(escape(window.atob(...)))).  Decoded verbatim
   on 2026-08-04 and moved to an external file: identical behaviour, readable in
   review, and no inline/eval script for a future Content-Security-Policy. */

(function(){
  "use strict";
  var PINS = [{"c":"Turku","n":"Finland","cc":"FI","lat":60.452,"lon":22.267,"p":"Urban Biodiversity Parks, Turku"},{"c":"Stockholm","n":"Sweden","cc":"SE","lat":59.33,"lon":18.07,"p":"PACES Stockholm"},{"c":"Dubai","n":"United Arab Emirates","cc":"AE","lat":25.26,"lon":55.31,"p":"Urbanist DubAI × Dubai Municipality"},{"c":"Helsinki","n":"Finland","cc":"FI","lat":60.17,"lon":24.938,"p":"ICLEI Youth Co-Design, Helsinki"},{"c":"Wiesbaden","n":"Germany","cc":"DE","lat":50.078,"lon":8.24,"p":"Child-Friendly Neighbourhoods, Wiesbaden"},{"c":"Poznań","n":"Poland","cc":"PL","lat":52.406,"lon":16.925,"p":"EDITUA Ecological District, Poznań"},{"c":"Enschede","n":"Netherlands","cc":"NL","lat":52.22,"lon":6.9,"p":"Blue & Green Spaces, Enschede"},{"c":"Dubai","n":"United Arab Emirates","cc":"AE","lat":25.205,"lon":55.271,"p":"RTA Demo, Dubai"},{"c":"Bucharest","n":"Romania","cc":"RO","lat":44.427,"lon":26.102,"p":"UrbanizeHUB, Bucharest"},{"c":"Harviala","n":"Finland","cc":"FI","lat":60.96,"lon":24.57,"p":"Harviala Workshop"},{"c":"East Cleveland","n":"United States","cc":"US","lat":41.533,"lon":-81.579,"p":"Connect East Cleveland"},{"c":"Newcastle","n":"United Kingdom","cc":"GB","lat":54.978,"lon":-1.617,"p":"City of Longevity, Newcastle"},{"c":"Singapore","n":"Singapore","cc":"SG","lat":1.29,"lon":103.85,"p":"URA Co-Design Methods, Singapore"},{"c":"Luleå","n":"Sweden","cc":"SE","lat":65.584,"lon":22.154,"p":"Participatory AI for Youth, Luleå"},{"c":"Pristina","n":"Kosovo","cc":"XK","lat":42.658,"lon":21.175,"p":"Children Co-Design, Pristina"},{"c":"WGS Dubai","n":"","cc":"","lat":25.13,"lon":55.19,"p":"Edge of Government, WGS Dubai"},{"c":"Pristina","n":"Kosovo","cc":"XK","lat":42.663,"lon":21.165,"p":"Kosovo Architecture Festival"},{"c":"Dubai","n":"United Arab Emirates","cc":"AE","lat":25.2,"lon":55.27,"p":"Urbanist DubAI"},{"c":"Zürich","n":"Switzerland","cc":"CH","lat":47.373,"lon":8.541,"p":"Denk Züri Neu, Zürich"},{"c":"Tallinn","n":"Estonia","cc":"EE","lat":59.44,"lon":24.744,"p":"BiodiverseCity, Tallinn"},{"c":"Helsinki","n":"Finland","cc":"FI","lat":60.168,"lon":24.952,"p":"Helsinki Market Squares"},{"c":"Tallinn","n":"Estonia","cc":"EE","lat":59.431,"lon":24.755,"p":"Spatial Hack, Tallinn"},{"c":"Nusantara","n":"Indonesia","cc":"ID","lat":-0.97,"lon":116.71,"p":"Nusantara Capital City 2023"},{"c":"Pristina","n":"Kosovo","cc":"XK","lat":42.663,"lon":21.166,"p":"Blloku 1 — community design, Pristina"},{"c":"Tallinn","n":"Estonia","cc":"EE","lat":59.397,"lon":24.664,"p":"TalTech Up-Skill Workshop"},{"c":"Tallinn","n":"Estonia","cc":"EE","lat":59.437,"lon":24.745,"p":"AvaLinn — resident co-design, Tallinn"},{"c":"Berlin","n":"Germany","cc":"DE","lat":52.52,"lon":13.405,"p":"Kiezlabor CityLAB Berlin 2023"},{"c":"Tallinn","n":"Estonia","cc":"EE","lat":59.452,"lon":24.732,"p":"Street Design with AI, Tallinn"},{"c":"Batumi","n":"Georgia","cc":"GE","lat":41.617,"lon":41.637,"p":"UNDP Demo, Batumi"},{"c":"Berlin","n":"Germany","cc":"DE","lat":52.52,"lon":13.405,"p":"Kiezlabor CityLAB Berlin 2025"},{"c":"Vienna","n":"Austria","cc":"AT","lat":48.208,"lon":16.374,"p":"Vienna Supergrätzl"},{"c":"Harviala","n":"Finland","cc":"FI","lat":60.95,"lon":24.56,"p":"Häme Region Planning, Harviala"},{"c":"Berlin","n":"Germany","cc":"DE","lat":52.52,"lon":13.4,"p":"Kiezlabor CityLAB Berlin 2024"},{"c":"Helsinki","n":"Finland","cc":"FI","lat":60.166,"lon":24.945,"p":"Helsinki Summer Streets"},{"c":"Bucharest","n":"Romania","cc":"RO","lat":44.432,"lon":26.104,"p":"New Urban Habits, Bucharest"},{"c":"Luleå","n":"Sweden","cc":"SE","lat":65.585,"lon":22.155,"p":"Children Reimagine Luleå"},{"c":"Rome","n":"Italy","cc":"IT","lat":41.9,"lon":12.5,"p":"UrbanistAI Launch, Rome"},{"c":"Hamburg","n":"","cc":"","lat":53.54,"lon":10.001,"p":"Urban Testbeds Jr, Hamburg"},{"c":"Kyiv","n":"Ukraine","cc":"UA","lat":50.45,"lon":30.52,"p":"Reconstruction Co-Design, Kyiv"},{"c":"Istanbul","n":"","cc":"","lat":41.01,"lon":28.98,"p":"Mayors for Economic Growth Network"},{"c":"Stuttgart","n":"Germany","cc":"DE","lat":48.78,"lon":9.18,"p":"Urban Futures, Stuttgart"},{"c":"Oulu","n":"Finland","cc":"FI","lat":65.012,"lon":25.465,"p":"Oulu Centre Vision 2040"},{"c":"Nusantara","n":"Indonesia","cc":"ID","lat":-0.97,"lon":116.71,"p":"Nusantara Capital City 2024"},{"c":"Munich","n":"Germany","cc":"DE","lat":48.152,"lon":11.581,"p":"Zamanand Festival, Munich"},{"c":"Vantaa","n":"Finland","cc":"FI","lat":60.322,"lon":25.06,"p":"Havukoski Futures, Vantaa"},{"c":"Panama City","n":"Panama","cc":"PA","lat":8.98,"lon":-79.52,"p":"Climate Scenario Planning, Panama"},{"c":"Kaarina","n":"Finland","cc":"FI","lat":60.41,"lon":22.37,"p":"Kaarina Market Square"},{"c":"Tallinn","n":"Estonia","cc":"EE","lat":59.437,"lon":24.754,"p":"YPO Keynote, Tallinn"},{"c":"Manila","n":"Philippines","cc":"PH","lat":14.6,"lon":120.98,"p":"Building Feminist Cities, Manila"},{"c":"Athens","n":"Greece","cc":"GR","lat":37.98,"lon":23.73,"p":"CIVINET Forum, Athens"},{"c":"Tallinn","n":"Estonia","cc":"EE","lat":59.4,"lon":24.67,"p":"TalTech Campus Entrance"},{"c":"Tallinn","n":"Estonia","cc":"EE","lat":59.44,"lon":24.75,"p":"Humanizing Digital Twins, Tallinn"},{"c":"Dubai","n":"United Arab Emirates","cc":"AE","lat":25.19,"lon":55.37,"p":"Dubai Park Co-Design"},{"c":"Milan","n":"Italy","cc":"IT","lat":45.47,"lon":9.18,"p":"Railway Station Co-Design, Milan"},{"c":"Oman","n":"Oman","cc":"OM","lat":23.59,"lon":58.38,"p":"Humanising Cities, Oman"},{"c":"Berlin","n":"Germany","cc":"DE","lat":52.5,"lon":13.42,"p":"Museum für Werte, Berlin"},{"c":"Skopje","n":"North Macedonia","cc":"MK","lat":41.99,"lon":21.43,"p":"Urban Reimagination of Skopje"},{"c":"Batumi","n":"Georgia","cc":"GE","lat":41.646,"lon":41.64,"p":"UNDP Collaboration, Batumi"},{"c":"Helsinki","n":"Finland","cc":"FI","lat":60.17,"lon":24.938,"p":"Forum Virium Helsinki Training"},{"c":"Lahti","n":"Finland","cc":"FI","lat":60.983,"lon":25.655,"p":"Lahti City Center Vision 2040"},{"c":"Valencia","n":"Spain","cc":"ES","lat":39.47,"lon":-0.377,"p":"CityDNA Conference, Valencia"},{"c":"Jyväskylä","n":"Finland","cc":"FI","lat":62.241,"lon":25.747,"p":"Jyväskylä Library Interiors"},{"c":"Bucharest","n":"Romania","cc":"RO","lat":44.427,"lon":26.103,"p":"GoTech World, Bucharest"},{"c":"Bologna","n":"Italy","cc":"IT","lat":44.495,"lon":11.343,"p":"Officine della Conoscenza, Bologna"},{"c":"Milan","n":"Italy","cc":"IT","lat":45.464,"lon":9.19,"p":"CoPlanAI Milan Workshop"},{"c":"Baku","n":"Azerbaijan","cc":"AZ","lat":40.409,"lon":49.867,"p":"CoPlanAI at World Urban Forum 13"},{"c":"Rotterdam","n":"Netherlands","cc":"NL","lat":51.92,"lon":4.48,"p":"Humankind Workshops, Rotterdam"},{"c":"Rotterdam","n":"Netherlands","cc":"NL","lat":51.921,"lon":4.481,"p":"Humankind, Rotterdam"},{"c":"Budapest","n":"Hungary","cc":"HU","lat":47.5,"lon":19.04,"p":"Momentum, Budapest"},{"c":"Jyväskylä","n":"Finland","cc":"FI","lat":62.24,"lon":25.75,"p":"Hakaniemi Design, Jyväskylä"},{"c":"Milan","n":"Italy","cc":"IT","lat":45.464,"lon":9.191,"p":"UNIMI Workshop, Milan"},{"c":"Jyväskylä","n":"Finland","cc":"FI","lat":62.241,"lon":25.749,"p":"Re-Centre Jyväskylä"},{"c":"Milan","n":"Italy","cc":"IT","lat":45.462,"lon":9.19,"p":"Children as Urban Planners, Milan"}];
  var CASEMAP={"6":"enschede-blue-green","18":"denk-zueri-neu","20":"helsinki-market-squares","21":"tallinn-liivalaia","22":"nusantara-2023","25":"avalinn-tallinn","30":"vienna-supergraetzl","33":"helsinki-summer-streets","42":"nusantara-2024","45":"panama-climate-futures","46":"kaarina-market-square","63":"bologna-officine-conoscenza"};var FRAME_W=1000.0, FRAME_H=500.0;
  var VX=0, VY=27.78, VW=1000.0, VH=380.56;
  var HREF="/use-cases/";

  function frame(lon,lat){ return { x:(lon+180)/360*FRAME_W, y:(90-lat)/180*FRAME_H }; }

  // Gentle relaxation so dense clusters (Finland, Germany) stay legible.
  // Flagships are anchors (never move); others may shift a few frame-units.
  function relax(pts){
    var MIN=9, MINF=12, MAXSHIFT=12, IT=60, i,j,k;
    for(k=0;k<IT;k++){
      for(i=0;i<pts.length;i++){ for(j=i+1;j<pts.length;j++){
        var a=pts[i], b=pts[j];
        var dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy);
        var min=(a.flag||b.flag)?MINF:MIN;
        if(d>0 && d<min){
          var push=(min-d), ux=dx/d, uy=dy/d;
          var aw=a.flag?0:(b.flag?1:0.5), bw=b.flag?0:(a.flag?1:0.5);
          a.x-=ux*push*aw; a.y-=uy*push*aw;
          b.x+=ux*push*bw; b.y+=uy*push*bw;
        }
      }}
      for(i=0;i<pts.length;i++){ var p=pts[i];
        var ox=p.x-p.bx, oy=p.y-p.by, m=Math.hypot(ox,oy);
        if(m>MAXSHIFT){ p.x=p.bx+ox/m*MAXSHIFT; p.y=p.by+oy/m*MAXSHIFT; }
      }
    }
  }

  function initRoot(root){
    var stage = root.querySelector(".cpmap-stage");
    var svg   = root.querySelector(".cpmap-base");
    var tip   = root.querySelector(".cpmap-tip");
    if(!stage||!svg||!tip) return;
    var NS="http://www.w3.org/2000/svg";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var vb0 = (svg.getAttribute("viewBox")||"0 0 1000 500").split(/[\s,]+/).map(Number);
    var BASE={x:vb0[0], y:vb0[1], w:vb0[2], h:vb0[3]};
    var view={x:BASE.x, y:BASE.y, w:BASE.w, h:BASE.h};
    var ZMAX=14, DOT=4.6, CLUSTER_PX=22;
    var old=root.querySelector(".cpmap-pins"); if(old) old.remove();
    var oldZ=root.querySelector(".cpmap-zoom"); if(oldZ) oldZ.remove();
    var oldC=root.querySelector(".cpmap-ctrls"); if(oldC) oldC.remove();
    function svgCls(el){return " "+(el.getAttribute("class")||"")+" ";}function svgHas(el,c){return svgCls(el).indexOf(" "+c+" ")>-1;}function svgAdd(el,c){if(el&&!svgHas(el,c))el.setAttribute("class",((el.getAttribute("class")||"")+" "+c).trim());}function svgDel(el,c){if(el)el.setAttribute("class",svgCls(el).split(" "+c+" ").join(" ").trim());}function proj(lon,lat){ return { x:(lon+180)/360*1000, y:(90-lat)/180*500 }; }
    var pts = PINS.map(function(d,i){ var f=proj(d.lon,d.lat);
      return { d:d, x:f.x, y:f.y, i:i, slug:CASEMAP[i]||null }; });
    var gPlot=document.createElementNS(NS,"g");
    gPlot.setAttribute("class","cpmap-plot");
    svg.appendChild(gPlot);
    var ctrls=document.createElement("div");
    ctrls.className="cpmap-ctrls";
    ctrls.innerHTML='<button type="button" data-z="in" aria-label="Zoom in">+</button>'
      +'<button type="button" data-z="out" aria-label="Zoom out">\u2212</button>'
      +'<button type="button" data-z="reset" aria-label="Reset the map view">\u25a2</button>';
    stage.appendChild(ctrls);
    var bIn=ctrls.querySelector('[data-z="in"]'), bOut=ctrls.querySelector('[data-z="out"]'), bRes=ctrls.querySelector('[data-z="reset"]');
    function k(){ return BASE.w/view.w; }
    function pxPerUnit(){ return (stage.clientWidth||1)/view.w; }
    function u(){ return 1/pxPerUnit(); }
    var clusters=[], lastKey=null, spider=null, gSpider=null, active=null;
    var drag=false, moved=false, sx=0, sy=0, ox=0, oy=0, pid=null;
    function buildClusters(){
      var R=CLUSTER_PX*u(), taken=[], i, j;
      clusters=[];
      for(i=0;i<pts.length;i++){
        if(taken[i]) continue;
        var g=[pts[i]]; taken[i]=1;
        for(j=i+1;j<pts.length;j++){
          if(taken[j]) continue;
          if(Math.hypot(pts[j].x-pts[i].x, pts[j].y-pts[i].y) < R){ g.push(pts[j]); taken[j]=1; }
        }
        var sxx=0, syy=0;
        g.forEach(function(p){ sxx+=p.x; syy+=p.y; });
        clusters.push({x:sxx/g.length, y:syy/g.length, m:g, hasCase:g.some(function(p){return !!p.slug;})});
      }
    }
    function mkPin(p, cx, cy){
      var el=document.createElementNS(NS, p.slug?"a":"g");
      if(p.slug){ el.setAttribute("href","/case-"+p.slug);
        el.setAttributeNS("http://www.w3.org/1999/xlink","href","/case-"+p.slug); }
      else el.setAttribute("role","img");
      el.setAttribute("class","cpmap-node"+(p.slug?" has-case":" no-case"));
      el.setAttribute("tabindex","0");
      el.setAttribute("aria-label", p.d.c+", "+p.d.n+" \u2014 "+(p.d.cl||p.d.p)+(p.slug?". Read the case":""));
      var halo=document.createElementNS(NS,"circle");
      halo.setAttribute("class","cpmap-halo"); halo.setAttribute("cx",cx); halo.setAttribute("cy",cy);
      var c=document.createElementNS(NS,"circle");
      c.setAttribute("class","cpmap-node-dot"); c.setAttribute("cx",cx); c.setAttribute("cy",cy);
      el.appendChild(halo); el.appendChild(c);
      el._pin=p; el._dot=c; el._halo=halo; el._slug=p.slug;
      return el;
    }
    function mkCluster(cl){
      var g=document.createElementNS(NS,"g");
      g.setAttribute("class","cpmap-cluster"+(cl.hasCase?" has-case":" no-case"));
      g.setAttribute("tabindex","0"); g.setAttribute("role","button");
      g.setAttribute("aria-label", cl.m.length+" projects near "+cl.m[0].d.c+". Activate to fan them out.");
      var ring=document.createElementNS(NS,"circle");
      ring.setAttribute("class","cpmap-cring"); ring.setAttribute("cx",cl.x); ring.setAttribute("cy",cl.y);
      var t=document.createElementNS(NS,"text");
      t.setAttribute("class","cpmap-cnum"); t.setAttribute("x",cl.x); t.setAttribute("y",cl.y);
      t.setAttribute("text-anchor","middle"); t.setAttribute("dominant-baseline","central");
      t.textContent=cl.m.length;
      g.appendChild(ring); g.appendChild(t);
      g._cl=cl; g._ring=ring; g._num=t;
      return g;
    }
    function render(){
      collapse(true);
      while(gPlot.firstChild) gPlot.removeChild(gPlot.firstChild);
      clusters.forEach(function(cl){
        gPlot.appendChild(cl.m.length===1 ? mkPin(cl.m[0], cl.x, cl.y) : mkCluster(cl));
      });
      sizeAll();
    }
    function sizeAll(){
      var uu=u();
      [].forEach.call(gPlot.querySelectorAll(".cpmap-node"), function(el){
        el._dot.setAttribute("r",(DOT*uu).toFixed(3));
        el._halo.setAttribute("r",((DOT+4)*uu).toFixed(3));
      });
      [].forEach.call(gPlot.querySelectorAll(".cpmap-cluster"), function(g){
        var n=g._cl.m.length;
        var rPx=DOT+2.4+Math.min(6, Math.log(n+1)*3);
        g._ring.setAttribute("r",(rPx*uu).toFixed(3));
        g._num.setAttribute("font-size",(rPx*0.95*uu).toFixed(3));
      });
      if(spider) sizeSpider();
    }
    function collapse(silent){
      if(gSpider&&gSpider.parentNode) gSpider.parentNode.removeChild(gSpider);
      gSpider=null; spider=null;
      if(!silent) hide(null);
      [].forEach.call(gPlot.querySelectorAll(".cpmap-cluster"), function(g){ svgDel(g,"is-open"); });
    }
    function sizeSpider(){
      if(!spider||!gSpider) return;
      var uu=u(), n=spider.m.length, R=(24+Math.min(26, n*2.6))*uu;
      [].forEach.call(gSpider.querySelectorAll(".cpmap-leg"), function(l,i){
        var a=-Math.PI/2 + i*2*Math.PI/n;
        l.setAttribute("x1",spider.x); l.setAttribute("y1",spider.y);
        l.setAttribute("x2",spider.x+Math.cos(a)*R); l.setAttribute("y2",spider.y+Math.sin(a)*R);
      });
      [].forEach.call(gSpider.querySelectorAll(".cpmap-node"), function(el,i){
        var a=-Math.PI/2 + i*2*Math.PI/n;
        var lx=spider.x+Math.cos(a)*R, ly=spider.y+Math.sin(a)*R;
        el._dot.setAttribute("cx",lx); el._dot.setAttribute("cy",ly);
        el._halo.setAttribute("cx",lx); el._halo.setAttribute("cy",ly);
        el._dot.setAttribute("r",(DOT*uu).toFixed(3));
        el._halo.setAttribute("r",((DOT+4)*uu).toFixed(3));
      });
    }
    function zoomToCluster(cl){var xs=cl.m.map(function(p){return p.x;}), ys=cl.m.map(function(p){return p.y;});var minx=Math.min.apply(null,xs), maxx=Math.max.apply(null,xs);var miny=Math.min.apply(null,ys), maxy=Math.max.apply(null,ys);var cx=(minx+maxx)/2, cy=(miny+maxy)/2;var need=Math.max((maxx-minx)*1.9,(maxy-miny)*1.9*(BASE.w/BASE.h), BASE.w/ZMAX);var w=Math.min(BASE.w, need), h=w*(BASE.h/BASE.w);collapse(true); tweenTo({x:cx-w/2, y:cy-h/2, w:w, h:h}, 420);}function activate(cl,node){ if(cl.m.length>8 && k()<ZMAX-0.01) zoomToCluster(cl); else spiderfy(cl,node); }function spiderfy(cl, node){
      if(spider===cl){ collapse(); return; }
      collapse(true);
      spider=cl;
      if(node) svgAdd(node,"is-open");
      gSpider=document.createElementNS(NS,"g");
      gSpider.setAttribute("class","cpmap-spider");
      cl.m.forEach(function(){
        var l=document.createElementNS(NS,"line");
        l.setAttribute("class","cpmap-leg"); gSpider.appendChild(l);
      });
      cl.m.forEach(function(p){ gSpider.appendChild(mkPin(p, cl.x, cl.y)); });
      gPlot.appendChild(gSpider);
      sizeSpider();
    }
    function fill(d, el){
      tip.innerHTML='<div class="cpmap-tip-proj"></div><div class="cpmap-tip-loc"></div>';
      tip.querySelector(".cpmap-tip-proj").textContent=d.cl||d.p;
      tip.querySelector(".cpmap-tip-loc").textContent=d.c+", "+d.n+(d.cl?" \u00b7 "+d.p:"");
      if(el&&el._slug){ var cta=document.createElement("div");
        cta.className="cpmap-tip-cta"; cta.textContent="Read the case \u2192"; tip.appendChild(cta); }
    }
    function fillCluster(cl){
      tip.innerHTML='<div class="cpmap-tip-proj"></div><div class="cpmap-tip-loc"></div><div class="cpmap-tip-cta"></div>';
      tip.querySelector(".cpmap-tip-proj").textContent=cl.m.length+" projects";
      var cities={}; cl.m.forEach(function(p){ cities[p.d.c]=1; });
      var names=Object.keys(cities);
      tip.querySelector(".cpmap-tip-loc").textContent =
        names.length===1 ? (cl.m[0].d.c+", "+cl.m[0].d.n) : names.slice(0,3).join(" \u00b7 ")+(names.length>3?" \u2026":"");
      tip.querySelector(".cpmap-tip-cta").textContent=(cl.m.length>8 && k()<ZMAX-0.01)?"Click to zoom in \u2192":"Click to fan out \u2192";
    }
    function place(x,y,rPx){
      var cx=(x-view.x)*pxPerUnit();
      var cy=(y-view.y)*((stage.clientHeight||1)/view.h);
      var tw=tip.offsetWidth, th=tip.offsetHeight;
      var sw=stage.clientWidth, sh=stage.clientHeight;
      var GAP=12, half=(rPx||DOT)+2;
      var below=(cy-half-GAP-th)<2;
      var top=below?(cy+half+GAP):(cy-half-GAP-th);
      if(below && (top+th>sh-2)){ below=false; top=cy-half-GAP-th; }
      var left=Math.max(6, Math.min(cx-tw/2, sw-tw-6));
      tip.style.left=left+"px"; tip.style.top=top+"px";
      tip.style.setProperty("--cpmap-caret", Math.max(12,Math.min(cx-left,tw-12))+"px");
      tip.classList.toggle("is-below", below);
      tip.classList.toggle("is-on", cx>-4 && cx<sw+4 && cy>-4 && cy<sh+4);
    }
    function showPin(el){
      if(active&&active!==el) svgDel(active,"is-active");
      active=el; svgAdd(el,"is-active");
      fill(el._pin.d, el);
      tip.style.left="0px"; tip.style.top="0px";
      place(+el._dot.getAttribute("cx"), +el._dot.getAttribute("cy"), DOT);
    }
    function showCluster(g){
      if(active&&active!==g) svgDel(active,"is-active");
      active=g; svgAdd(g,"is-active");
      fillCluster(g._cl);
      tip.style.left="0px"; tip.style.top="0px";
      place(g._cl.x, g._cl.y, (+g._ring.getAttribute("r"))*pxPerUnit());
    }
    function hide(el){
      if(el) svgDel(el,"is-active");
      else if(active) svgDel(active,"is-active");
      active=null; tip.classList.remove("is-on");
    }
    gPlot.addEventListener("mouseover", function(e){
      var n=e.target.closest(".cpmap-node"); if(n){ showPin(n); return; }
      var c=e.target.closest(".cpmap-cluster"); if(c) showCluster(c);
    });
    gPlot.addEventListener("mouseout", function(e){
      var t=e.target.closest(".cpmap-node,.cpmap-cluster");
      if(t && !t.contains(e.relatedTarget)) hide(t);
    });
    gPlot.addEventListener("focusin", function(e){
      var n=e.target.closest(".cpmap-node"); if(n){ showPin(n); return; }
      var c=e.target.closest(".cpmap-cluster"); if(c) showCluster(c);
    });
    gPlot.addEventListener("focusout", function(e){
      var t=e.target.closest(".cpmap-node,.cpmap-cluster"); if(t) hide(t);
    });
    gPlot.addEventListener("click", function(e){
      if(e.detail&&e.detail>1){ e.preventDefault(); return; }
      if(moved){ e.preventDefault(); e.stopPropagation(); return; }
      var c=e.target.closest(".cpmap-cluster");
      if(c){ e.preventDefault(); e.stopPropagation(); activate(c._cl, c); }
    }, true);
    gPlot.addEventListener("keydown", function(e){
      if(e.key!=="Enter"&&e.key!==" ") return;
      var c=e.target.closest(".cpmap-cluster");
      if(c){ e.preventDefault(); activate(c._cl, c); }
    });
    stage.addEventListener("keydown", function(e){ if(e.key==="Escape") collapse(); });
    function clampView(){
      if(view.w>BASE.w) view.w=BASE.w;
      if(view.h>BASE.h) view.h=BASE.h;
      if(view.x<BASE.x) view.x=BASE.x;
      if(view.y<BASE.y) view.y=BASE.y;
      if(view.x+view.w>BASE.x+BASE.w) view.x=BASE.x+BASE.w-view.w;
      if(view.y+view.h>BASE.y+BASE.h) view.y=BASE.y+BASE.h-view.h;
    }
    function paint(){
      clampView();
      svg.setAttribute("viewBox", view.x.toFixed(3)+" "+view.y.toFixed(3)+" "+view.w.toFixed(3)+" "+view.h.toFixed(3));
      var key=view.w.toFixed(2);
      if(key!==lastKey){ lastKey=key; buildClusters(); render(); } else sizeAll();
      var z=k();
      stage.classList.toggle("is-zoomed", z>1.001);
      bIn.disabled=z>=ZMAX-0.001; bOut.disabled=z<=1.001; bRes.disabled=z<=1.001;
    }
    var anim=null;
    function tweenTo(t, ms){
      if(anim){ cancelAnimationFrame(anim); anim=null; }
      if(reduce || !ms || document.visibilityState!=="visible"){ view.x=t.x; view.y=t.y; view.w=t.w; view.h=t.h; paint(); return; }
      var s={x:view.x,y:view.y,w:view.w,h:view.h}, t0=null;
      function step(ts){
        if(t0===null) t0=ts;
        var p=Math.min(1,(ts-t0)/ms);
        var e=p<0.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2;
        view.x=s.x+(t.x-s.x)*e; view.y=s.y+(t.y-s.y)*e;
        view.w=s.w+(t.w-s.w)*e; view.h=s.h+(t.h-s.h)*e;
        paint();
        if(p<1) anim=requestAnimationFrame(step); else anim=null;
      }
      anim=requestAnimationFrame(step);
    }
    function zoomAt(factor, cxPx, cyPx, ms){
      var r=stage.getBoundingClientRect();
      var fx=(cxPx-r.left)/r.width, fy=(cyPx-r.top)/r.height;
      var nw=view.w/factor, nh=view.h/factor;
      if(BASE.w/nw>ZMAX){ nw=BASE.w/ZMAX; nh=BASE.h/ZMAX; }
      if(nw>BASE.w){ nw=BASE.w; nh=BASE.h; }
      var ax=view.x+view.w*fx, ay=view.y+view.h*fy;
      collapse(true);
      tweenTo({x:ax-nw*fx, y:ay-nh*fy, w:nw, h:nh}, ms);
    }
    function zoomCentre(f){ var r=stage.getBoundingClientRect(); zoomAt(f, r.left+r.width/2, r.top+r.height/2, 260); }
    ctrls.addEventListener("click", function(e){
      var b=e.target.closest("button"); if(!b) return;
      e.preventDefault(); e.stopPropagation();
      var kk=b.getAttribute("data-z");
      if(kk==="in") zoomCentre(1.7);
      else if(kk==="out") zoomCentre(1/1.7);
      else { collapse(true); tweenTo({x:BASE.x,y:BASE.y,w:BASE.w,h:BASE.h}, 320); }
    });
    ["pointerdown","pointerup","dblclick"].forEach(function(t){
      ctrls.addEventListener(t, function(e){ e.stopPropagation(); });
    });
    stage.addEventListener("pointerdown", function(e){
      var onMark=e.target.closest(".cpmap-cluster,.cpmap-node,.cpmap-ctrls");
      if(!onMark) collapse();
      /* never take pointer capture over a mark: capture retargets the event stream to
         the stage, so the click never reaches the cluster and fan-out silently dies */
      if(onMark) return;
      if(e.button!==0 || k()<=1.001) return;
      drag=true; moved=false; pid=e.pointerId;
      sx=e.clientX; sy=e.clientY; ox=view.x; oy=view.y;
      if(anim){ cancelAnimationFrame(anim); anim=null; }
      try{ stage.setPointerCapture(pid); }catch(err){}
      stage.classList.add("is-panning");
    });
    stage.addEventListener("pointermove", function(e){
      if(!drag) return;
      var dx=e.clientX-sx, dy=e.clientY-sy;
      if(!moved && Math.hypot(dx,dy)>4) moved=true;
      if(!moved) return;
      var r=stage.getBoundingClientRect();
      view.x=ox-dx*(view.w/r.width); view.y=oy-dy*(view.h/r.height);
      paint();
    });
    function endDrag(){
      if(!drag) return;
      drag=false; stage.classList.remove("is-panning");
      try{ if(pid!=null) stage.releasePointerCapture(pid); }catch(err){}
      setTimeout(function(){ moved=false; },0);
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("wheel", function(e){
      if(!(e.ctrlKey||e.metaKey)) return;
      e.preventDefault();
      zoomAt(e.deltaY<0?1.16:1/1.16, e.clientX, e.clientY, 0);
    }, {passive:false});
    stage.addEventListener("dblclick", function(e){ e.preventDefault(); zoomAt(1.9, e.clientX, e.clientY, 300); });
    var P2={};
    function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
    stage.addEventListener("pointerdown", function(e){ P2[e.pointerId]={x:e.clientX,y:e.clientY}; });
    stage.addEventListener("pointermove", function(e){
      if(!(e.pointerId in P2)) return;
      var ids=Object.keys(P2);
      if(ids.length===2){
        var was=dist(P2[ids[0]],P2[ids[1]]);
        P2[e.pointerId]={x:e.clientX,y:e.clientY};
        var now=dist(P2[ids[0]],P2[ids[1]]);
        if(was>0){ var mx=(P2[ids[0]].x+P2[ids[1]].x)/2, my=(P2[ids[0]].y+P2[ids[1]].y)/2; zoomAt(now/was, mx, my, 0); }
      } else P2[e.pointerId]={x:e.clientX,y:e.clientY};
    });
    function clearPt(e){ delete P2[e.pointerId]; }
    stage.addEventListener("pointerup", clearPt);
    stage.addEventListener("pointercancel", clearPt);
    window.addEventListener("resize", function(){ lastKey=null; paint(); }, {passive:true});
    paint();
  }

  function boot(){ document.querySelectorAll(".cpmap").forEach(initRoot); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

;
function ucFilter(b){document.querySelectorAll('.fchip').forEach(function(c){c.classList.remove('active')});b.classList.add('active');var a=b.getAttribute('data-a');var n=0;document.querySelectorAll('.uc-band').forEach(function(band){var show=(a=='all'||band.getAttribute('data-a')==a);band.style.display=show?'':'none';if(show)n+=band.querySelectorAll('.uc-card').length});document.getElementById('ucount').textContent=n;}function ucView(v){document.getElementById('vgrid').classList.toggle('on',v=='grid');document.getElementById('vlist').classList.toggle('on',v=='list');document.querySelectorAll('.uc-grid').forEach(function(g){g.classList.toggle('list',v=='list')});}
;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll('.rise').forEach(function(el,i){el.style.transitionDelay=((i%4)*70)+'ms';io.observe(el)});