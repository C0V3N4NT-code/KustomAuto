// Approved preview geometry and timing: only the body moves; wheels remain fixed.
const body=document.querySelector('.body');
const wheelWells=document.querySelector('.wheel-well-backing');
const truckButton=document.querySelector('.truck-interaction');
const soundButton=document.querySelector('#sound-toggle');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let height=0,target=0,frame=0,soundEnabled=false,audio=null,airSource=null;
function draw(value){height=value;const offset=44*(1-value);body.style.transform=`translateY(${offset}px)`;wheelWells.setAttribute('transform',`translate(0 ${offset})`);}
function playAirRelease(){
  if(!soundEnabled)return;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;
  audio??=new AudioCtx();
  audio.resume().catch(()=>{});
  if(airSource){try{airSource.stop();}catch{}}
  const n=Math.floor(audio.sampleRate*2.4),buffer=audio.createBuffer(1,n,audio.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<n;i++){const t=i/n;data[i]=(Math.random()*2-1)*Math.min(1,t*32)*Math.pow(1-t,2.15);}
  const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
  source.buffer=buffer;filter.type='bandpass';filter.frequency.setValueAtTime(3900,audio.currentTime);filter.frequency.exponentialRampToValueAtTime(850,audio.currentTime+2.4);filter.Q.value=.46;gain.gain.value=.35;
  source.connect(filter).connect(gain).connect(audio.destination);source.start();airSource=source;
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();if(airSource===source)airSource=null;};
}
function setTruckRaised(raised){
  const to=raised?1:0;if(to===target&&height===to)return;
  cancelAnimationFrame(frame);target=to;
  truckButton.setAttribute('aria-pressed',String(raised));truckButton.setAttribute('aria-label',raised?'Lower the truck':'Raise the truck');
  const start=height,time=performance.now(),duration=reducedMotion.matches?0:(to>start?2600:3200);
  if(to<start)playAirRelease();
  function tick(now){const p=duration?Math.min(1,(now-time)/duration):1;const ease=p*p*p*(p*(p*6-15)+10);draw(start+(to-start)*ease);if(p<1)frame=requestAnimationFrame(tick);}
  frame=requestAnimationFrame(tick);
}
truckButton.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')setTruckRaised(true);});
truckButton.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')setTruckRaised(false);});
truckButton.addEventListener('click',()=>setTruckRaised(!target));
soundButton.addEventListener('click',()=>{
  soundEnabled=!soundEnabled;soundButton.textContent=soundEnabled?'Sound on':'Sound off';soundButton.setAttribute('aria-pressed',String(soundEnabled));
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(soundEnabled&&AudioCtx){audio??=new AudioCtx();audio.resume().catch(()=>{});}
  if(!soundEnabled&&airSource){try{airSource.stop();}catch{}}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);draw(target);if(airSource){try{airSource.stop();}catch{}}}});
const vehicleForm = document.querySelector('#vehicle-form');
vehicleForm.addEventListener('submit', event => {
  event.preventDefault();
  const details = new FormData(vehicleForm);
  const value = key => String(details.get(key) || '').trim();
  const message = [
    'Hi Kustom Auto Worx!',
    `My name is ${value('customer')}.`,
    `Vehicle: ${value('year')} ${value('make')} ${value('model')}`,
    '',
    `Work requested: ${value('work')}`
  ].join('\n');
  document.querySelector('#message-preview').value = message;
  const appleDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  document.querySelector('#open-text').href = `sms:+16825210379${appleDevice ? '&' : '?'}body=${encodeURIComponent(message)}`;
  document.querySelector('#text-draft').hidden = false;
});
vehicleForm.addEventListener('input', () => {
  document.querySelector('#text-draft').hidden = true;
});
