(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A slowly twinkling, locally drawn night sky.
  const canvas = $('#stars'), ctx = canvas.getContext('2d');
  let width, height, dpr, stars = [];
  const resize = () => {
    width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * dpr; canvas.height = height * dpr; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; ctx.setTransform(dpr,0,0,dpr,0,0);
    stars = Array.from({length:Math.min(145,Math.floor(width*height/7600))},()=>({x:Math.random()*width,y:Math.random()*height,r:.3+Math.random()*1.15,a:.15+Math.random()*.55,p:Math.random()*7,s:.002+Math.random()*.009}));
  };
  const draw = (t=0) => { ctx.clearRect(0,0,width,height); for(const s of stars){const a=s.a*(.65+Math.sin(t*s.s+s.p)*.35);ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,232,225,${a})`;ctx.fill();if(s.r>1.2){ctx.fillStyle=`rgba(255,215,201,${a*.65})`;ctx.fillRect(s.x-3,s.y-.35,6,.7);ctx.fillRect(s.x-.35,s.y-3,.7,6)}} if(!reduced)requestAnimationFrame(draw);};
  resize(); draw(); addEventListener('resize',resize);
  addEventListener('pointermove',e=>{const g=$('.pointer-glow');g.style.left=`${e.clientX}px`;g.style.top=`${e.clientY}px`;});

  const screens = ['gate','quiz','score','birthday','memory','letter','game'];
  const chapterNames = ['A PRIVATE LITTLE SURPRISE','OUR LITTLE LOVE QUIZ','A LITTLE LOVE REPORT','YOUR BIRTHDAY','OUR FAVORITE KIND OF US','A LETTER FOR YOU','OUR NEXT LITTLE DATE'];
  const go = id => { screens.forEach(s=>$('#'+s).classList.toggle('active',s===id)); $('#chapter').textContent=chapterNames[screens.indexOf(id)]||''; window.scrollTo({top:0,behavior:reduced?'auto':'smooth'}); };
  const toast = text => { const t=$('#toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2100); };

  // The password is intentionally never shown or hinted at in the interface.
  $('#passwordForm').addEventListener('submit',e=>{e.preventDefault();const v=$('#password').value.trim();if(['11-16','11/16','1116'].includes(v)){ $('#passwordError').textContent='';go('quiz');renderQuestion();startMusic(); }else{ $('#passwordError').textContent='That password didn’t open this little door. Try again.';$('#password').classList.remove('shake');void $('#password').offsetWidth;$('#password').classList.add('shake');$('#password').value='';$('#password').focus(); }});
  $('#showPassword').addEventListener('click',()=>{$('#password').type=$('#password').type==='password'?'text':'password';});

  const questions=[
    {title:'Agar tumhara boyfriend upset ho, tum kya karti ho?',answers:['Ignore karti hoon','Puchti hoon kya hua','Usko comfort karti hoon','Uska mood theek karne ki full koshish karti hoon']},
    {title:'Agar tum dono ka argument ho jaye, tum kya karti ho?',answers:['Baat band kar deti hoon','Thori der space leti hoon','Baat karke solve karne ki koshish karti hoon','Ego side par rakh kar relationship ko priority deti hoon']},
    {title:'Tumhara boyfriend tumhe kitna samajhta hai?',answers:['Bohat kam','Thora bohat','Mostly mujhe samajh leta hai','Bina kahe bhi meri feelings samajh jata hai']},
    {title:'Jab tumhara boyfriend busy ho aur tumhe time na de paye, tum kya feel karti ho?',answers:['Bohat gussa aata hai','Thora bura lagta hai','Uski situation samajhne ki koshish karti hoon','Usko support karti hoon aur uske free hone ka wait karti hoon']},
    {title:'Tumhare boyfriend ki choti choti baatein tumhe kitni yaad rehti hain?',answers:['Zyada nahi','Kuch baatein yaad rehti hain','Mostly important things yaad rehti hain','Almost har choti baat yaad rehti hai ❤️']},
    {title:'Agar tumhare boyfriend ko tumhari help ya support chahiye ho, tum kya karti ho?',answers:['Dekhti hoon mere paas time hai ya nahi','Jitna possible ho help karti hoon','Uske saath khari hoti hoon','Apni problems ke bawajood usko support karne ki poori koshish karti hoon ❤️']},
    {title:'Tumhare liye apne boyfriend ke saath relationship mein sabse important kya hai?',answers:['Love aur attraction','Time aur attention','Trust aur understanding','Trust, respect, communication aur dono ki equal effort ❤️']}
  ];
  const points=[1,2,3,4], answers=Array(questions.length).fill(-1);let current=0;
  const scoreNow=()=>answers.reduce((sum,a)=>sum+(a<0?0:points[a]),0)/28*100;
  const renderQuestion=()=>{
    const q=questions[current], selected=answers[current];$('#questionCount').textContent=`QUESTION ${String(current+1).padStart(2,'0')} / ${String(questions.length).padStart(2,'0')}`;
    $('#progressFill').style.width=`${((current+1)/questions.length)*100}%`;$('#liveScore').textContent=`${Math.round(scoreNow())}%`;
    $('#questionArea').innerHTML=`<h3 class="question-title">${q.title}</h3><div class="answers">${q.answers.map((a,i)=>`<button class="answer ${selected===i?'selected':''}" data-answer="${i}"><span class="answer-key">${String.fromCharCode(65+i)}</span><span>${a}</span><small class="answer-points">${i+1} pt</small></button>`).join('')}</div>`;
    $$('.answer').forEach(el=>el.addEventListener('click',()=>{answers[current]=Number(el.dataset.answer);renderQuestion();}));
    $('#nextQuestion').disabled=selected<0;$('#nextQuestion span').textContent=current===questions.length-1?'SEE OUR LOVE SCORE':'NEXT QUESTION';$('#backQuestion').style.visibility=current===0?'hidden':'visible';
  };
  $('#nextQuestion').addEventListener('click',()=>{if(answers[current]<0)return;if(current<questions.length-1){current++;renderQuestion();}else showScore();});
  $('#backQuestion').addEventListener('click',()=>{if(current>0){current--;renderQuestion();}});
  function showScore(){const value=Math.round(scoreNow());$('#scoreValue').textContent=value;$('#scoreRing').style.setProperty('--score',`${value*3.6}deg`);$('#scoreTitle').innerHTML=value>=90?'Dil se, dil tak<br><em>our love keeps growing.</em>':value>=70?'A lovely little<br><em>love story in bloom.</em>':'A sweet start to<br><em>many more memories.</em>';$('#scoreCopy').textContent=`Tumhara Love Score ${value}% hai — har sahi feeling, care aur effort se hamari story aur beautiful hoti hai. ❤️`;go('score');celebrate(42);}
  $('#toBirthday').addEventListener('click',()=>{go('birthday');playBirthdayTune();});

  // Candle blow-out works with mouse, touch, keyboard, and reduced-motion preferences.
  const blow=$('#blowButton');let holdTimer;
  const startHold=e=>{e.preventDefault();if($('#cakeWrap').classList.contains('blown'))return;blow.classList.add('holding');$('#birthdayScene').classList.add('air-flow');$('#blowLabel').textContent='BLOWING…';holdTimer=setTimeout(()=>{$('#cakeWrap').classList.add('blown');blow.classList.remove('holding');blow.classList.add('hidden');$('#birthdayScene').classList.remove('air-flow');$('#windWave').classList.add('gust');setTimeout(()=>$('#windWave').classList.remove('gust'),1300);$('#cakeInstructions').classList.add('hidden');$('#cutInstructions').classList.remove('hidden');$('#cutButton').classList.remove('hidden');celebrate(88);chime();},reduced?150:1150);};
  const cancelHold=()=>{clearTimeout(holdTimer);$('#birthdayScene').classList.remove('air-flow');if(!blow.classList.contains('hidden')){blow.classList.remove('holding');$('#blowLabel').textContent='PRESS & HOLD TO BLOW';}};
  blow.addEventListener('pointerdown',startHold);['pointerup','pointerleave','pointercancel'].forEach(ev=>blow.addEventListener(ev,cancelHold));blow.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')startHold(e)});blow.addEventListener('keyup',cancelHold);
  $('#cutButton').addEventListener('click',()=>{const cake=$('#cakeWrap');cake.classList.add('cut');$('#cutButton').classList.add('hidden');$('#cutInstructions').innerHTML='<span class="instruction-icon">♡</span><b>One slice for you, one for me.</b><span>My favorite things are always better shared</span>';$('#memory').dataset.fromCake='yes';setTimeout(()=>go('memory'),1900);chime();});
  function celebrate(n){if(reduced)return;const box=$('#birthdayConfetti');const palette=['#ffd9d4','#e8c995','#ed91a8','#d8b7dd','#fff4ec'];for(let i=0;i<n;i++){const p=document.createElement('i');p.className='confetti-piece';p.style.left=`${Math.random()*100}%`;p.style.background=palette[Math.floor(Math.random()*palette.length)];p.style.setProperty('--dur',`${2.5+Math.random()*3}s`);p.style.setProperty('--delay',`${Math.random()*.9}s`);p.style.setProperty('--move',`${Math.random()*180-90}px`);p.style.setProperty('--turn',`${Math.random()*1200-600}deg`);p.style.borderRadius=Math.random()>.6?'50%':'1px';box.appendChild(p);setTimeout(()=>p.remove(),6500);}}
  $('#toLetter').addEventListener('click',()=>go('letter'));
  $('#openLetter').addEventListener('click',()=>{$('#envelope').classList.add('open');$('#letter').classList.add('opened');$('#openLetter').setAttribute('aria-label','Letter opened');});
  $('#restart').addEventListener('click',()=>{answers.fill(-1);current=0;$('#envelope').classList.remove('open');$('#letter').classList.remove('opened');$('#cakeWrap').classList.remove('blown','cut');$('#blowButton').classList.remove('hidden');$('#cutButton').classList.add('hidden');$('#cakeInstructions').classList.remove('hidden');$('#cutInstructions').classList.add('hidden');$('#blowLabel').textContent='PRESS & HOLD TO BLOW';go('gate');});
  $('#toCoupleGame').addEventListener('click',()=>go('game'));
  $('#replayFromGame').addEventListener('click',()=>$('#restart').click());
  const datePicks={mood:null,treat:null,ending:null};
  $$('.game-options button').forEach(button=>button.addEventListener('click',()=>{const group=button.closest('.game-step');group.querySelectorAll('button').forEach(b=>b.classList.remove('chosen'));button.classList.add('chosen');datePicks[group.dataset.step]=button.dataset.value;$('#mixDate').disabled=Object.values(datePicks).some(v=>!v);$('#dateResult').textContent='';}));
  $('#mixDate').addEventListener('click',()=>{const mood={cozy:'a cozy blanket fort',adventure:'a little sunset adventure',silly:'a silly at-home date'}[datePicks.mood],treat={chai:'chai and something sweet',picnic:'a tiny strawberry picnic',cake:'birthday cake for two'}[datePicks.treat],ending={stars:'stargazing and making one more wish',movie:'one last movie cuddled up close',walk:'a long moonlit walk, hand in hand'}[datePicks.ending];$('#dateResult').innerHTML=`<span>OUR LITTLE DATE PLAN ✿</span><strong>${mood}, ${treat},</strong><b>then ${ending}.</b><small>Just us sounds like the perfect plan. ❤️</small>`;celebrate(35);chime();});

  // Original, gentle synthesized ambient music. Starts only after the visitor taps Play.
  let audio=null, musicNodes=[], musicTimer, musicStep=0;
  function getAudio(){if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();return audio;}
  function playNote(freq,at,dur,volume=.05,type='triangle'){const a=getAudio(),o=a.createOscillator(),g=a.createGain(),o2=a.createOscillator(),g2=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);o2.type='sine';o2.frequency.setValueAtTime(freq*2.01,at);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.018);g.gain.exponentialRampToValueAtTime(Math.max(volume*.28,.0002),at+.11);g.gain.exponentialRampToValueAtTime(.0001,at+dur);g2.gain.setValueAtTime(.0001,at);g2.gain.exponentialRampToValueAtTime(volume*.17,at+.012);g2.gain.exponentialRampToValueAtTime(.0001,at+Math.min(.24,dur));o.connect(g).connect(a.destination);o2.connect(g2).connect(a.destination);o.start(at);o2.start(at);o.stop(at+dur+.04);o2.stop(at+Math.min(.24,dur)+.04);musicNodes.push(o,o2);}
  const chordSets=[[261.63,329.63,392,493.88],[220,261.63,329.63,392],[174.61,261.63,349.23,440],[196,246.94,392,493.88]];
  async function startMusic(){if(musicTimer)return;const a=getAudio();await a.resume();musicStep=0;musicTimer=setInterval(()=>{const chord=chordSets[Math.floor(musicStep/8)%chordSets.length],beat=musicStep%8,when=a.currentTime+.03;playNote(chord[beat%4],when,1.25,.065,'triangle');if(beat%2===0)playNote(chord[beat%4]/2,when,1.7,.033,'sine');musicStep++;},470);$('#music').classList.add('playing');$('#musicLabel').textContent='PIANO ON';}
  function playBirthdayTune(){try{const a=getAudio();a.resume();const melody=[392,392,440,392,523.25,493.88,392,392,440,392,587.33,523.25,392,392,783.99,659.25,523.25,493.88,440,698.46,698.46,659.25,523.25,587.33,523.25];const beat=.39,offset=.16;melody.forEach((f,i)=>playNote(f,a.currentTime+offset+i*beat,(i%6===5?.58:.32),.11,'triangle'));}catch{}}
  $('#music').addEventListener('click',async()=>{if(musicTimer){clearInterval(musicTimer);musicTimer=null;musicNodes.forEach(n=>{try{n.stop()}catch{}});musicNodes=[];$('#music').classList.remove('playing');$('#musicLabel').textContent='PLAY PIANO';}else{try{await startMusic();}catch{toast('Music is not available in this browser.');}}});
  function chime(){try{const a=getAudio();[523.25,659.25,783.99].forEach((f,i)=>playNote(f,a.currentTime+i*.13,.9,.06,'triangle'));}catch{}}
})();
