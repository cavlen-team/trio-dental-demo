(function(){
var H=document.documentElement;if(!H.classList.contains('cin'))return;
var C=window.CINEMA||{},ease=function(t){return 1-Math.pow(1-t,4)};
// 1. split text into masked words (or chars) so they rise in
function splitNode(n,mode,st){
  if(n.nodeType===3){
    var parts=mode==='chars'?n.nodeValue.split(''):n.nodeValue.split(/(\s+)/),f=document.createDocumentFragment();
    parts.forEach(function(p){
      if(!p)return;if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(' '));return}
      var w=document.createElement('span');w.className='w';var s=document.createElement('span');s.textContent=p;s.style.setProperty('--i',st.i++);w.appendChild(s);f.appendChild(w)});
    n.parentNode.replaceChild(f,n)
  }else if(n.nodeType===1&&n.tagName!=='BR'){Array.prototype.slice.call(n.childNodes).forEach(function(c){splitNode(c,mode,st)})}
}
(C.split||[]).forEach(function(o){document.querySelectorAll(o.s).forEach(function(el){
  var label=el.textContent.trim();el.setAttribute('aria-label',label);splitNode(el,o.mode||'words',{i:0});
  el.querySelectorAll('.w').forEach(function(w){w.setAttribute('aria-hidden','true')});
  if(o.b)el.style.setProperty('--b',o.b+'ms');el.classList.add(o.hero?'hero-go':'split');el.dataset.hero=o.hero?1:0})});
// 2. reveal-once elements with stagger
(C.rise||[]).forEach(function(s){document.querySelectorAll(s).forEach(function(el,i){el.classList.add('rv');el.style.setProperty('--d',(i%6)*90+'ms')})});
(C.unmask||[]).forEach(function(s){document.querySelectorAll(s).forEach(function(el){el.classList.add('unmask')})});
(C.draw||[]).forEach(function(s){document.querySelectorAll(s).forEach(function(el){el.classList.add('draw')})});
// 3. loader
var ld=document.getElementById('ld'),started=false;
function lock(v){H.classList.toggle('lock',v);if(window.__lenis)v?__lenis.stop():__lenis.start()}
// smooth scroll
if(window.Lenis){var L=new Lenis({duration:1.25,easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t))}});window.__lenis=L;
  (function r(t){L.raf(t);requestAnimationFrame(r)})(0)}
lock(true);
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
function begin(){
  if(started)return;started=true;
  if(ld){ld.classList.add('out');setTimeout(function(){ld.classList.add('gone')},600)}
  lock(false);
  setTimeout(function(){
    document.querySelectorAll('[data-hero="1"], .unmask').forEach(function(e){e.classList.add('in')});
    document.querySelectorAll('.rv,.split,.unmask,.draw').forEach(function(e){io.observe(e)});
    countUp()},ld?150:0)}
var ready=false,minT=false;
setTimeout(function(){minT=true;if(ready)begin()},600);
function rd(){ready=true;if(minT)begin()}
(document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,650)})]):Promise.resolve()).then(rd);
setTimeout(begin,1300);
// 4. count-up numbers
function countUp(){(C.count||[]).forEach(function(s){document.querySelectorAll(s).forEach(function(el){
  var m=el.textContent.match(/\d+(\.\d+)?/);if(!m)return;var end=parseFloat(m[0]),dec=(m[1]||'').length-(m[1]?1:0),txt=el.textContent;
  var o=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;o.disconnect();var t0=performance.now();
    (function f(t){var p=Math.min(1,(t-t0)/1600),v=end*ease(p);el.textContent=txt.replace(m[0],v.toFixed(dec));if(p<1)requestAnimationFrame(f)})(t0)});o.observe(el)})})}
// 5. parallax + scroll progress
var px=(C.px||[]).map(function(a){return{els:[].slice.call(document.querySelectorAll(a[0])),k:a[1],bg:a[2]}}),sp=document.getElementById('sp'),ticking=false;
function upd(){ticking=false;var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;if(sp)sp.style.transform='scaleX('+(h>0?y/h:0)+')';
  px.forEach(function(g){g.els.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<-200||r.top>innerHeight+200)return;
    var d=(r.top+r.height/2-innerHeight/2)*g.k;if(g.bg)el.style.backgroundPosition='50% calc(50% '+(d>=0?'+':'-')+Math.abs(d).toFixed(1)+'px)';else el.style.translate='0 '+d.toFixed(1)+'px'})})}
addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd)}},{passive:true});upd();
})();
