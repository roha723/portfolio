/* Bidirectional local world travel, with cancellation and native-link fallback. */
(()=>{
 const modal=document.querySelector('#world-transition'),direct=modal.querySelector('.travel-direct'),status=modal.querySelector('.travel-status'),soundButton=modal.querySelector('.travel-sound');
 let timer=0,phase=0,origin=null,context=null,osc=null,gain=null,muted=true;
 function stopSound(){if(osc){try{osc.stop();}catch{}osc.disconnect();osc=null;}gain?.disconnect();gain=null;}
 function startSound(){if(muted)return;try{context??=new(window.AudioContext||window.webkitAudioContext)();context.resume().then(()=>{if(!modal.open||muted||osc)return;osc=context.createOscillator();gain=context.createGain();osc.type='sine';osc.frequency.setValueAtTime(65,context.currentTime);osc.frequency.exponentialRampToValueAtTime(180,context.currentTime+3);gain.gain.setValueAtTime(.001,context.currentTime);gain.gain.linearRampToValueAtTime(.07,context.currentTime+.3);osc.connect(gain);gain.connect(context.destination);osc.start();}).catch(()=>{});}catch{}}
 function cleanup(){clearTimeout(timer);clearTimeout(phase);stopSound();modal.classList.remove('travelling');}
 function close(){cleanup();modal.close();origin?.focus({preventScroll:true});}
 document.querySelectorAll('#portal a[href]').forEach(link=>link.addEventListener('click',event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey||typeof modal.showModal!=='function')return;
  event.preventDefault();if(modal.open)return;origin=link;status.textContent='Портал находит путь…';modal.showModal();modal.classList.add('travelling');modal.querySelector('.travel-cancel').focus();startSound();
  const duration=reduced?700:3200;phase=setTimeout(()=>{status.textContent=document.body.dataset.world==='end'?'Возвращаемся в Незер…':'Открываем мир Края…';},duration/2);
  timer=setTimeout(()=>{cleanup();window.location.assign(direct.href);},duration);
 }));
 modal.querySelector('.travel-cancel').addEventListener('click',close);modal.addEventListener('cancel',e=>{e.preventDefault();close();});modal.addEventListener('close',cleanup);direct.addEventListener('click',cleanup);
 soundButton.addEventListener('click',()=>{muted=!muted;soundButton.setAttribute('aria-pressed',String(!muted));soundButton.textContent=muted?'Звук: выкл':'Звук: вкл';if(muted)stopSound();else startSound();});
 window.addEventListener('pagehide',cleanup);window.addEventListener('pageshow',()=>{if(modal.open)close();});
})();
