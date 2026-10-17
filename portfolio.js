'use strict';
const projects=window.PORTFOLIO, grid=document.querySelector('#projects'), dialog=document.querySelector('#project-dialog');
const isEnd=document.body.dataset.world==='end';
const inWorld=p=>isEnd?['ai','social'].includes(p.category):!['ai','social'].includes(p.category);
const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
function render(filter='all'){
 grid.replaceChildren();
 projects.forEach((p,index)=>{if(!inWorld(p)||(filter!=='all'&&p.category!==filter))return;
 const card=make('button','project');card.type='button';card.setAttribute('aria-label',`Открыть проект: ${p.title}`);
 const art=make('div','project-image');
 const fallback=make('div',`art ${p.art||''}`);fallback.append(make('strong','',p.art==='pipeline'?'Stories on Change':p.art==='social'?'@arkulframe':p.title),make('small','',p.label));art.append(fallback);
 if(p.videos){const img=make('img');img.src=`https://i.ytimg.com/vi/${p.videos[0]}/hqdefault.jpg`;img.alt='';img.loading='lazy';img.addEventListener('error',()=>img.remove());art.append(img);}
 art.append(make('span','project-number',`PROJECT / ${String(index+1).padStart(2,'0')}`),make('span','play',p.videos?'▷':'↗'));
 const body=make('div','project-body'),meta=make('div','project-meta');meta.append(make('span','',p.label),make('span','',p.videos?`${String(p.videos.length).padStart(2,'0')} VIDEO`:'EXPLORE ↗'));body.append(meta,make('h3','',p.title),make('p','project-role',p.role));card.append(art,body);card.addEventListener('click',()=>openProject(index));grid.append(card);
 });document.querySelector('#count').textContent=`ПОКАЗАНО ${String(grid.children.length).padStart(2,'0')} / ${String(projects.filter(inWorld).length).padStart(2,'0')}`;
}
let lastFocus;
function openProject(index){const p=projects[index];lastFocus=document.activeElement;const content=document.querySelector('#dialog-content');content.replaceChildren();const heading=make('h2','',p.title);heading.id='dialog-title';content.append(heading,make('p','eyebrow',p.role),make('p','',p.description));
 if(p.videos){const localFile=location.protocol==='file:';const tabs=make('div','video-tabs'),frame=make(localFile?'div':'iframe','video-frame'),link=make('a','external');if(localFile){frame.style.cssText='display:grid;place-content:center;text-align:center;padding:24px;aspect-ratio:auto;min-height:180px';frame.append(make('p','','Для просмотра прямо на сайте откройте его через START-PORTFOLIO.cmd.'),make('p','','Или смотрите видео на YouTube по кнопке ниже.'));}frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Смотреть на YouTube ↗';const load=(id,i)=>{if(!localFile)frame.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0&origin=${encodeURIComponent(location.origin)}`;frame.title=`${p.title} — видео ${i+1}`;link.href=`https://youtu.be/${id}`;[...tabs.children].forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));};p.videos.forEach((id,i)=>{const b=make('button','',`Видео ${i+1}`);b.addEventListener('click',()=>load(id,i));tabs.append(b);});if(p.videos.length>1)content.append(tabs);content.append(frame,link);load(p.videos[0],0);
 }else{const link=make('a','button',p.category==='social'?'Открыть Instagram ↗':'Открыть YouTube-канал ↗');link.href=p.url;link.target='_blank';link.rel='noopener noreferrer';content.append(link);}
 dialog.showModal();document.body.style.overflow='hidden';document.querySelector('#close-dialog').focus();
}
function closeProject(){dialog.close();}
document.querySelector('#close-dialog').addEventListener('click',closeProject);
dialog.addEventListener('close',()=>{document.querySelector('#dialog-content').replaceChildren();document.body.style.overflow='';lastFocus?.focus();});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject();});
document.querySelectorAll('[data-project]').forEach(b=>b.addEventListener('click',()=>openProject(Number(b.dataset.project))));
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render(b.dataset.filter);}));
const motion=document.querySelector('#motion');let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;try{const saved=localStorage.getItem('arkulov-motion');if(saved!==null)reduced=saved==='off';}catch{}
function setMotion(){document.documentElement.classList.toggle('reduce-motion',reduced);motion.setAttribute('aria-pressed',String(reduced));motion.textContent=reduced?'▷ Анимации':'Ⅱ Анимации';motion.setAttribute('aria-label',reduced?'Включить анимации':'Отключить анимации');}motion.addEventListener('click',()=>{reduced=!reduced;setMotion();try{localStorage.setItem('arkulov-motion',reduced?'off':'on');}catch{}});setMotion();
let pending=false;window.addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{const range=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress').style.width=`${range>0?scrollY/range*100:0}%`;pending=false;});},{passive:true});
document.querySelector('#year').textContent=new Date().getFullYear();render();
