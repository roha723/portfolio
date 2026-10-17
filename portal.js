/* Portal travel: local procedural audio, accessible dialog, normal link fallback. */
(()=>{
  const modal=document.querySelector('#world-transition');
  const links=document.querySelectorAll('#portal a[href]');
  const status=modal.querySelector('.travel-status');
  const audioButton=modal.querySelector('.travel-sound');
  const destination=modal.querySelector('.travel-direct').href;
  let timers=[],origin=null,active=false,context=null,voice=null,travelMuted=false;

  function stopAudio(){
    if(!voice)return;
    const current=voice;voice=null;
    current.sources.forEach(source=>{try{source.stop();source.disconnect();}catch{}});
    current.nodes.forEach(node=>{try{node.disconnect();}catch{}});
  }
  function portalSound(){
    if(travelMuted||!effectEnabled)return;
    try{
      context??=new (window.AudioContext||window.webkitAudioContext)();
      context.resume().then(()=>{
        if(!active||travelMuted||!effectEnabled||voice)return;
        const t=context.currentTime,duration=4.8;
        const master=context.createGain();
        master.gain.setValueAtTime(0,t);
        master.gain.linearRampToValueAtTime(.28,t+.3);
        master.gain.setValueAtTime(.28,t+2.8);
        master.gain.exponentialRampToValueAtTime(.001,t+duration);
        master.connect(context.destination);
        const sources=[],nodes=[master];voice={sources,nodes};
        // Low resonant drone and a rising, filtered rush of air.
        [55,82.4,111].forEach((frequency,index)=>{
          const osc=context.createOscillator(),gain=context.createGain();
          osc.type='sine';osc.frequency.setValueAtTime(frequency,t);
          osc.frequency.exponentialRampToValueAtTime(frequency*1.6,t+3.7);
          gain.gain.value=index===0?.24:.09;
          osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+duration);
          sources.push(osc);nodes.push(gain);
        });
        const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
        const samples=buffer.getChannelData(0);let smooth=0;
        for(let i=0;i<samples.length;i++){smooth=(smooth+.025*(Math.random()*2-1))/1.025;samples[i]=smooth*6;}
        const noise=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
        noise.buffer=buffer;filter.type='bandpass';filter.Q.value=1.7;
        filter.frequency.setValueAtTime(180,t);filter.frequency.exponentialRampToValueAtTime(1700,t+3.6);
        gain.gain.setValueAtTime(.1,t);gain.gain.linearRampToValueAtTime(.5,t+3.1);
        noise.connect(filter);filter.connect(gain);gain.connect(master);
        noise.start(t);noise.stop(t+duration);sources.push(noise);nodes.push(filter,gain);
        const lfo=context.createOscillator(),depth=context.createGain();
        lfo.frequency.setValueAtTime(3.2,t);lfo.frequency.linearRampToValueAtTime(8,t+3.8);
        depth.gain.value=95;lfo.connect(depth);depth.connect(filter.frequency);
        lfo.start(t);lfo.stop(t+duration);sources.push(lfo);nodes.push(depth);
      }).catch(()=>{});
    }catch{}
  }
  function updateSound(){
    const on=!travelMuted&&effectEnabled;
    audioButton.textContent=on?'Звук: вкл':'Звук: выкл';
    audioButton.setAttribute('aria-pressed',String(on));
  }
  function cleanup(){timers.forEach(clearTimeout);timers=[];stopAudio();active=false;modal.classList.remove('travel-active');}
  function cancel(){cleanup();if(modal.open)modal.close();origin?.focus({preventScroll:true});}
  function enter(event){
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    if(typeof modal.showModal!=='function')return;
    event.preventDefault();if(active)return;
    active=true;origin=event.currentTarget;status.textContent='Портал находит путь…';
    updateSound();modal.showModal();modal.classList.add('travel-active');
    modal.querySelector('.travel-cancel').focus();portalSound();
    timers.push(setTimeout(()=>{status.textContent='Проходим сквозь портал…';},1600));
    timers.push(setTimeout(()=>{status.textContent='Мир Края уже близко…';},3300));
    timers.push(setTimeout(()=>{
      stopAudio();status.textContent='Открываем другой мир…';
      window.location.assign(destination);
    },4800));
  }
  links.forEach(link=>link.addEventListener('click',enter));
  modal.querySelector('.travel-cancel').addEventListener('click',cancel);
  modal.addEventListener('cancel',event=>{event.preventDefault();cancel();});
  modal.addEventListener('close',cleanup);
  audioButton.addEventListener('click',()=>{
    if(!effectEnabled){effectEnabled=true;const toggle=document.querySelector('.sound-toggle');toggle.setAttribute('aria-pressed','true');toggle.setAttribute('aria-label','Выключить звуковые эффекты');toggle.firstElementChild.textContent='♫';travelMuted=false;}
    else travelMuted=!travelMuted;
    updateSound();if(travelMuted)stopAudio();else portalSound();
  });
  modal.querySelector('.travel-direct').addEventListener('click',cleanup);
  window.addEventListener('pagehide',cleanup);
  window.addEventListener('pageshow',()=>{if(modal.open&&!active)modal.close();});
})();
