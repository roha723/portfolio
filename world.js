/* World navigation, role switch and restrained entrance effects. */
(()=>{
  const hotbar=document.querySelector('.world-hotbar');
  const sections=[...hotbar.querySelectorAll('a')].map(a=>document.querySelector(a.hash));
  const header=document.querySelector('.site-header');let ticking=false;
  function update(){
    ticking=false;const y=window.scrollY;
    header.classList.toggle('scrolled',y>60);
    hotbar.classList.toggle('is-visible',y>window.innerHeight*.55);
    let active=null;
    for(const section of sections)if(section.getBoundingClientRect().top<window.innerHeight*.5)active=section.id;
    hotbar.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    header.querySelectorAll('nav a').forEach(a=>a.classList.toggle('current',a.hash==='#'+active));
  }
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update,{passive:true});update();
  const roleButtons=[...document.querySelectorAll('[data-role]')];
  function role(button){
    const engineering=button.dataset.role==='engineering';
    roleButtons.forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
    const panel=document.querySelector('#role-panel');panel.setAttribute('aria-labelledby',button.id);
    panel.querySelector('h3').textContent=engineering?'Связать код и механику':'Дать роботу логику';
    panel.querySelector('p').textContent=engineering?'Кроме программирования, я участвовал в инженерной работе. Код и конструкция должны работать вместе — именно на поле становится ясно, насколько хорошо они понимают друг друга.':'Я отвечал за код робота: превращал задачу в алгоритм, а алгоритм — в действия на поле.';
    document.querySelector('.forge-profile').classList.toggle('engineering-active',engineering);
    sound(engineering?330:440,.1);
  }
  roleButtons.forEach((button,index)=>{
    button.addEventListener('click',()=>role(button));
    button.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?1:1-index;
      role(roleButtons[next]);roleButtons[next].focus();
    });
  });
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('world-entered');reveal.unobserve(entry.target);}
  }),{threshold:.12});
  document.querySelectorAll('.forge-profile,.stats,.mission-console,.trophy-card,.lab-console,.contact-links').forEach(el=>reveal.observe(el));
})();
