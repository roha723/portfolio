/* Low-resolution animated portal texture. The frame is real HTML blocks. */
(()=>{
  const canvas=document.querySelector('.mc-portal-canvas');
  const ctx=canvas?.getContext('2d');if(!ctx)return;
  const width=64,height=96;canvas.width=width;canvas.height=height;
  const pixels=ctx.createImageData(width,height);let frame=0,last=0,visible=true;
  const vortices=[[.22,.2,0],[.79,.55,2],[.23,.93,4]];
  function paint(time){
    const t=time*.00065;
    // Moving centers and domain warping make the texture reshape, not just rotate.
    const movingVortices=vortices.map(([cx,cy,phase])=>[
      cx+Math.sin(t*.85+phase)*.13,
      cy+Math.cos(t*.7+phase)*.085,
      phase
    ]);
    // Overlapping spiral currents: thin luminous bands, dark violet depth.
    const palette=[[50,14,93],[63,19,115],[77,24,136],[92,29,155],
      [108,38,174],[124,49,188],[145,66,205],[166,87,219],
      [190,117,234],[213,154,247]];
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const u=x/width+Math.sin(y/height*9-t*1.3)*.065;
      const v=y/height+Math.sin(x/width*8+t)*.045;
      let current=0,weight=0;
      for(const [cx,cy,phase] of movingVortices){
        const dx=u-cx,dy=(v-cy)*1.5;
        const radius=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
        const influence=Math.exp(-radius*radius*8);
        current+=Math.sin(radius*(23+Math.sin(t*.6+phase)*3)-angle*2-t*1.8+phase)*influence;
        weight+=influence;
      }
      const ripple=current/Math.max(.2,weight);
      const echo=Math.sin(u*21+v*19-t*1.6+Math.sin(v*13-t)*1.3);
      const ridge=Math.pow((ripple+1)*.5,3);
      const grain=Math.sin(x*1.71+y*2.31)*.018;
      const value=Math.max(0,Math.min(.999,.30+ridge*.40+echo*.10+grain));
      const color=palette[Math.floor(value*10)],i=(y*width+x)*4;
      pixels.data[i]=color[0];pixels.data[i+1]=color[1];pixels.data[i+2]=color[2];pixels.data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);
    // Sparse square flecks drift through the surface at different depths.
    for(let j=0;j<23;j++){
      const x=(j*23+7)%width,y=((j*37-time*.003*(.45+j%3))%height+height)%height;
      const alpha=.13+(Math.sin(t*3+j*2)+1)*.16;
      ctx.fillStyle='rgba(211,150,244,'+alpha+')';
      ctx.fillRect(x,Math.floor(y),j%4===0?2:1,j%4===0?2:1);
    }
  }
  function animate(time){frame=0;if(!visible||document.hidden||reduced)return;if(time-last>=32){paint(time);last=time;}frame=requestAnimationFrame(animate);}
  function refresh(){cancelAnimationFrame(frame);frame=0;if(reduced)paint(0);else if(visible&&!document.hidden)frame=requestAnimationFrame(animate);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();},{rootMargin:'100px'});
  observer.observe(canvas);document.addEventListener('visibilitychange',refresh);
  document.querySelector('#motion').addEventListener('click',refresh);
  paint(0);refresh();
})();
