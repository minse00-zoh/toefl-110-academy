(function academyApp(){
"use strict";
const d=window.TOEFL_LESSON;
if(!d||!Array.isArray(d.vocabulary)||d.vocabulary.length!==30){document.getElementById("view").textContent="학습자료를 불러오지 못했습니다.";return;}
const key=d.storageKey;
const menu=[["overview","▦","학습 개요"],["reading","▤","Reading"],["listening","◉","Listening"],["speaking","◌","Speaking"],["writing","✎","Writing"],["vocab","◇","Vocabulary"],["review","✓","학습 기록"]];
const init=()=>({page:"overview",elapsed:0,timerOn:false,choices:{},graded:{},cloze:{},build:{},writing:{},interview:{},checks:{},shown:{},vocab:{tab:"wordbook",mode:"meaning",known:{},misses:{},answers:{},graded:{},card:0,flipped:false,notes:""}});
let s=init();
try{const old=JSON.parse(localStorage.getItem(key)||"null");if(old&&typeof old==="object"){s={...init(),...old,timerOn:false,page:"overview"};s.vocab={...init().vocab,...(old.vocab||{})};}}catch(e){}
const E=t=>String(t??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const paragraphs=t=>String(t||"").split(/\n\n+/).filter(Boolean).map(p=>"<p>"+E(p)+"</p>").join("");
const normalize=t=>String(t||"").trim().toLowerCase().replace(/[.,!?;:]/g,"").replace(/\s+/g," ");
const save=()=>{try{localStorage.setItem(key,JSON.stringify({...s,timerOn:false}));}catch(e){}};
function toast(text){const el=document.getElementById("toast");el.textContent=text;el.classList.add("show");clearTimeout(toast.id);toast.id=setTimeout(()=>el.classList.remove("show"),2600);}
function clock(){const n=s.elapsed;return [Math.floor(n/3600),Math.floor(n%3600/60),n%60].map(x=>String(x).padStart(2,"0")).join(":");}
function panel(html){return '<section class="panel">'+html+"</section>";}
function head(title,sub,time){return '<div class="section-header"><div><h2 class="sectiontitle">'+E(title)+'</h2><p class="subtitle">'+E(sub)+'</p></div><span class="pill">'+E(time)+'</span></div>';}
function qGroup(id,items){
 const marked=Boolean(s.graded[id]);const done=items.filter((_,i)=>s.choices[id+"-"+i]!==undefined).length;
 return '<div class="qgroup">'+items.map((q,i)=>{
  const selected=s.choices[id+"-"+i];return '<div class="question"><h4>'+(i+1)+'. '+E(q.q)+'</h4><div class="options">'+q.options.map((o,j)=>
  '<button type="button" class="option '+(selected===j?"selected ":"")+(marked&&q.answer===j?"correct ":"")+(marked&&selected===j&&j!==q.answer?"wrong":"")+'" data-choose="'+E(id+"-"+i)+'" data-value="'+j+'"><span class="letter">'+("ABCD"[j]||String(j+1))+'</span><span>'+E(o)+'</span></button>').join("")+'</div>'+(marked?'<div class="explain"><b>'+ (selected===q.answer?"✓ 정답":"정답: "+("ABCD"[q.answer]||q.answer))+'</b><div>'+E(q.why)+'</div></div>':"")+"</div>";
 }).join("")+'<div class="answerbar"><span class="status">'+done+'/'+items.length+'개 답변'+(marked?' · 정답 '+items.filter((q,i)=>s.choices[id+"-"+i]===q.answer).length+'/'+items.length:'')+'</span><button class="btn" data-grade="'+E(id)+'" type="button">채점 및 해설 보기</button></div></div>';
}
function progress(){
 const groups=["rd","ra","rp","lq","lc","la","lt"];
 let total=d.cloze.length+d.writing.build.length+d.speaking.repeat.length+d.speaking.interviews.length+2+d.vocabulary.length;
 let done=d.cloze.filter((_,i)=>String(s.cloze[i]||"").trim()).length+d.writing.build.filter((_,i)=>String(s.build[i]||"").trim()).length;
 done+=d.speaking.repeat.filter((_,i)=>Boolean(s.checks["repeat"+i])).length+d.speaking.interviews.filter((_,i)=>String(s.interview[i]||"").trim()).length;
 done+=["email","discussion"].filter(k=>String(s.writing[k]||"").trim()).length;
 done+=d.vocabulary.filter((_,i)=>Boolean(s.vocab.known[i])).length;
 for(const g of groups){const qs=d.questions[g]||[];total+=qs.length;done+=qs.filter((_,i)=>s.choices[g+"-"+i]!==undefined).length;}
 return {done,total,percent:Math.round(done/Math.max(total,1)*100)};
}
function sidebar(){
 const p=progress(),day=String(d.day).padStart(2,"0");
 document.getElementById("sidebar").innerHTML='<div class="brand"><div class="logo">T</div><div><strong>TOEFL 110+</strong><small>ADVANCED ACADEMY</small></div></div><div class="side-group">WEEK '+d.week+' · DAY '+day+'</div>'+menu.map(([id,icon,label])=>'<button class="navbtn '+(s.page===id?"active":"")+'" data-nav="'+id+'"><span class="navico">'+icon+'</span>'+label+(["reading","listening","speaking","writing"].includes(id)?'<span class="num">DAY '+day+'</span>':"")+"</button>").join("")+'<div class="sidefoot"><strong>● 학습 내역 자동 저장</strong>진도 '+p.done+'/'+p.total+' · '+p.percent+'%<div class="bars" style="margin-top:9px;background:#ffffff29"><div style="width:'+p.percent+'%"></div></div><p style="margin-bottom:0">현재 브라우저에만 답변이 저장됩니다.</p></div>';
 document.getElementById("mobilebar").innerHTML=menu.map(([id,icon,label])=>'<button data-nav="'+id+'" class="'+(s.page===id?"active":"")+'">'+label+'</button>').join("");
 document.getElementById("crumb").textContent='Day '+day+' / '+(menu.find(m=>m[0]===s.page)?.[2]||"학습 개요");
 document.getElementById("clock").textContent=clock();
 document.getElementById("timerBtn").textContent=s.timerOn?"Ⅱ 일시정지":"▶ 학습 시작";
}
function overview(){
 const p=progress();
 const focus=["유형 전환·진단","Reading 정밀 추론","Listening 화자 의도","Speaking 정확성·유창성"][d.week-1]||"고급 영어";
 return '<div class="hero"><span class="eyebrow">WEEK '+String(d.week).padStart(2,"0")+' · DAY '+String(d.day).padStart(2,"0")+'</span><h1>'+E(d.theme)+'</h1><p>'+E(d.claim)+'</p><div class="stats"><div><b>120m</b><span>오늘의 집중 학습</span></div><div><b>30</b><span>C1–C2 단어·표현</span></div><div><b>'+p.percent+'%</b><span>현재 학습 진도</span></div></div></div>'+panel(head("오늘의 학습","8주 로드맵의 "+focus+" 단계","120 MIN")+
 '<table class="schedule"><thead><tr><th>영역</th><th>시간</th><th>핵심 활동</th></tr></thead><tbody>'+[["Reading","30분","Complete the Words · Daily Life · Academic"],["Listening","25분","Response · Conversation · Announcement · Academic Talk"],["Speaking","25분","Listen and Repeat · Interview"],["Writing","30분","Sentence · Email · Academic Discussion"],["오답 복습","10분","오답 및 어휘 약점 기록"]].map(r=>'<tr><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join("")+"</tbody></table>"+'<div class="answerbar"><span class="status">영역별 실전 모의 문항이 아닌 개별 심화 훈련 자료입니다.</span><button class="btn" data-nav="reading">Day '+d.day+' 시작 →</button></div>')+
 panel('<h3 class="blocktitle" style="margin-top:0">이번 Day의 핵심 주장</h3><div class="passage">'+paragraphs([d.claim,d.evidence,d.caveat,d.response].join("\n\n"))+'</div><p class="note">2026년 TOEFL iBT 연습 유형을 참고한 자체 제작 문제입니다. ETS 공식 문항이나 공식 채점은 아닙니다. 점수 목표 110+는 기존 0–120 척도 기준이며 현행 1–6 척도와 구분합니다.</p>');
}
function reading(){
 const cloze=d.cloze.map((w,i)=>'<div class="clozeitem"><label>'+(i+1)+'. '+E(w.partial)+'</label><input class="inputline" data-cloze="'+i+'" value="'+E(s.cloze[i]||"")+'" placeholder="완성된 단어 입력" autocomplete="off">'+(s.graded.cloze?'<div class="hint">'+(normalize(s.cloze[i])===normalize(w.answer)?"✓":"✗")+' '+E(w.answer)+' · '+E(w.meaning)+'</div>':"")+'</div>').join("");
 return panel(head("Reading","조건·예외·근거·추론 중심 독해","30 MIN")+
 '<h3 class="blocktitle">01. Complete the Words</h3><p class="blockmeta">5분 · 문맥에서 올바른 어휘를 완성하세요.</p><div class="passage">'+paragraphs(d.readingClozePassage)+'</div><div class="clozegroup">'+cloze+'</div><div class="answerbar"><span class="status">6문항 · 전체 단어를 입력</span><button class="btn" data-grade="cloze">채점 및 정답 확인</button></div>'+
 '<h3 class="blocktitle">02. Read in Daily Life</h3><p class="blockmeta">5분 · 공지 목적과 조건, 세부 정보 파악</p><div class="passage">'+paragraphs(d.notice)+'</div>'+qGroup("rd",d.questions.rd)+
 '<h3 class="blocktitle">03. Read an Academic Passage</h3><p class="blockmeta">15분 · 중심 논지와 제한조건, 대안적 설명</p><div class="passage">'+paragraphs(d.academicPassage)+'</div>'+qGroup("ra",d.questions.ra)+
 '<h3 class="blocktitle">04. Precision Check</h3><p class="blockmeta">5분 · 1차 답보다 정확한 추론 검토</p>'+qGroup("rp",d.questions.rp));
}
function audio(id,name,guide,script,qs){
 const visible=Boolean(s.shown[id]);
 return '<h3 class="blocktitle">'+E(name)+'</h3><p class="blockmeta">'+E(guide)+'</p><div class="audiohead"><button class="audio" data-speak="'+id+'">▶ 영어 음성 듣기</button><button class="btn ghost" data-reveal="'+id+'">'+(visible?"스크립트 숨기기":"스크립트 보기")+'</button><span class="status">TTS 음성 · 듣고 먼저 답변</span></div>'+(visible?'<div class="transcript">'+E(script).replace(/\n/g,"<br>")+'</div>':"")+qGroup(id,qs);
}
function listening(){return panel(head("Listening","명시된 사실과 화자 의도를 구분하는 청취 훈련","25 MIN")+
 '<p class="note">실제 시험 녹음이 아닌 브라우저의 영어 TTS를 사용합니다. 스크립트 보기 전에 먼저 청취하세요.</p>'+
 audio("lq","01. Listen and Choose a Response","3분 · 공손한 정정과 함축 의미",d.audio.lq,d.questions.lq)+
 audio("lc","02. Listen to a Conversation","7분 · 학내 행사 및 절차 파악",d.audio.lc,d.questions.lc)+
 audio("la","03. Listen to an Announcement","5분 · 일정·조건·예외 확인",d.audio.la,d.questions.la)+
 audio("lt","04. Listen to an Academic Talk","10분 · 주장·근거·유보 표현 듣기",d.audio.lt,d.questions.lt)+
 '<div class="callout"><b>고득점 청취 메모</b><br>Not necessarily, however, whereas, it depends on, by contrast 같은 표현은 화자의 입장 수정이나 제한을 나타냅니다.</div>');
}
function speaking(){
 return panel(head("Speaking","정확한 듣고 따라 말하기 · 즉흥 인터뷰","25 MIN")+
 '<h3 class="blocktitle">01. Listen and Repeat</h3><p class="blockmeta">10분 · 음성만 듣고 먼저 말한 뒤, 문장을 확인하고 완료 표시하세요.</p>'+
 d.speaking.repeat.map((t,i)=>'<div class="question"><div class="toolbar"><b>Sentence '+(i+1)+'</b><div><button class="audio" data-repeat="'+i+'">▶ 듣기</button> <button class="tiny" data-reveal="repeat'+i+'">'+(s.shown["repeat"+i]?"원문 숨기기":"원문 보기")+'</button></div></div>'+(s.shown["repeat"+i]?'<div class="revealframe">'+E(t)+'</div>':'<p class="helptext">문장을 들은 다음 복창하세요.</p>')+'<label class="checkrow"><input type="checkbox" data-tick="repeat'+i+'" '+(s.checks["repeat"+i]?"checked":"")+'> <span>발음·강세·의미 단위를 점검했습니다.</span></label></div>').join("")+
 '<h3 class="blocktitle">02. Take an Interview</h3><p class="blockmeta">15분 · 각 문항에 45~60초 답하고 핵심 논점과 개선점을 적으세요.</p>'+
 d.speaking.interviews.map((t,i)=>'<div class="question"><h4>Question '+(i+1)+'. '+E(t)+'</h4><textarea data-interview="'+i+'" style="min-height:95px" placeholder="자신의 답변 메모">'+E(s.interview[i]||"")+'</textarea></div>').join("")+
 '<div class="toolbar"><button class="btn ghost" data-reveal="speakingSample">'+(s.shown.speakingSample?"모범 답변 숨기기":"모범 답변 보기")+'</button></div>'+(s.shown.speakingSample?'<div class="model">'+E(d.speaking.sample)+'</div>':"")+
 '<div class="callout"><b>자기평가 체크리스트</b><br>① 시작 10초 내에 입장을 제시했는가? ② 구체적인 사례를 연결했는가? ③ 반대 가능성을 인정했는가? ④ 불필요한 반복 없이 결론에 도달했는가?</div>');
}
function writing(){
 return panel(head("Writing","문법적 정확성 · 이메일 · 학술 토론","30 MIN")+
 '<h3 class="blocktitle">01. Build a Sentence</h3><p class="blockmeta">6분 · 분리된 어구를 자연스러운 문장으로 재구성하세요.</p>'+
 d.writing.build.map((q,i)=>'<div class="question"><h4>Sentence '+(i+1)+'</h4><div class="promptbox">'+E(q.fragments)+'</div><textarea data-build="'+i+'" style="min-height:78px" placeholder="완성 문장을 입력하세요">'+E(s.build[i]||"")+'</textarea>'+(s.graded.build?'<div class="explain"><b>'+(normalize(s.build[i])===normalize(q.answer)?"✓ 일치":"권장 답변")+'</b> '+E(q.answer)+'<br>'+E(q.why)+'</div>':"")+'</div>').join("")+
 '<div class="answerbar"><span class="status">5문항 · 문장 수준 비교</span><button class="btn" data-grade="build">모범 답안 및 해설</button></div>'+
 '<h3 class="blocktitle">02. Write an Email</h3><p class="blockmeta">10분 · 상황에 맞는 목적·요청·마무리 구성</p><div class="promptbox">'+E(d.writing.emailTask)+'</div><textarea data-writing="email" style="min-height:210px" placeholder="이메일을 작성하세요">'+E(s.writing.email||"")+'</textarea><div class="toolbar"><span class="status">'+String(s.writing.email||"").trim().split(/\s+/).filter(Boolean).length+' words</span><button class="btn ghost" data-reveal="emailSample">모범 이메일 '+(s.shown.emailSample?"숨기기":"보기")+'</button></div>'+(s.shown.emailSample?'<div class="model">'+E(d.writing.emailSample).replace(/\n/g,"<br>")+'</div>':"")+
 '<h3 class="blocktitle">03. Write for an Academic Discussion</h3><p class="blockmeta">14분 · 교수 질문과 두 학생의 시각을 연결해 120~180단어 작성</p><div class="promptbox">'+E(d.writing.discussionTask).replace(/\n/g,"<br>")+'</div><textarea data-writing="discussion" style="min-height:210px" placeholder="자신의 주장과 근거를 작성하세요">'+E(s.writing.discussion||"")+'</textarea><div class="toolbar"><span class="status">'+String(s.writing.discussion||"").trim().split(/\s+/).filter(Boolean).length+' words</span><button class="btn ghost" data-reveal="discussionSample">모범 토론 답변 '+(s.shown.discussionSample?"숨기기":"보기")+'</button></div>'+(s.shown.discussionSample?'<div class="model">'+E(d.writing.discussionSample)+'</div>':"")+
 '<p class="note">서술형 과제의 자동 점수 환산은 제공하지 않습니다. 목적 적합성·정확성·논리성·어휘의 자연스러움을 모범 답변과 직접 비교하세요.</p>');
}
let v=s.vocab;
const coreIds=[0,3,6,9,12,15,18,21,24,27];
function distractors(id){const wrong=[(id+7)%30,(id+13)%30,(id+19)%30];const pos=id%4;const options=wrong.slice();options.splice(pos,0,id);return {options,correct:pos};}
function vocabBook(){return '<div class="vsection-head"><h3>Advanced Wordbook</h3><span class="pill mint">총 30개</span></div><div class="vocabscroll"><table class="vocabtable vwordtable"><thead><tr><th>Word / Phrase</th><th>한국어 뜻</th><th>Collocation · Example</th><th>암기·발음</th></tr></thead><tbody>'+d.vocabulary.map((w,i)=>'<tr><td><strong>'+E(w.term)+'</strong><br><small>'+(i<12?"TOPIC":"ADVANCED")+'</small></td><td>'+E(w.meaning)+'</td><td>'+E(w.collocation)+'<div class="vsub">'+E(w.example)+'</div></td><td><button class="viconbutton" data-sayword="'+i+'">▶</button> <button class="vlearn '+(v.known[i]?"islearned":"")+'" data-known="'+i+'">'+(v.known[i]?"✓ 암기":"○ 미암기")+'</button></td></tr>').join("")+'</tbody></table></div>';}
function vocabFlash(){
 const idx=Math.max(0,Math.min(29,v.card)),w=d.vocabulary[idx];
 return '<div class="vsection-head"><h3>Flashcards</h3><span class="pill">'+(idx+1)+' / 30</span></div><button class="vflash '+(v.flipped?"flipped":"")+'" data-flip="1"><span class="vsmall">'+(v.flipped?"뜻 확인":"의미를 떠올리세요")+'</span><strong>'+E(v.flipped?w.meaning:w.term)+'</strong>'+(v.flipped?'<div class="vflashdetail">'+E(w.collocation)+'<p>'+E(w.example)+'</p></div>':'<span class="vflashhint">탭하여 뒤집기</span>')+'</button><div class="vcardcontrols"><button class="btn ghost" data-card="-1" '+(idx===0?"disabled":"")+'>← 이전</button><button class="btn ghost" data-sayword="'+idx+'">▶ 발음</button><button class="btn ghost" data-card="1" '+(idx===29?"disabled":"")+'>다음 →</button></div><div class="vcardcontrols"><button class="btn warn" data-forget="'+idx+'">↺ 다시 학습</button><button class="btn mint" data-known="'+idx+'">✓ 암기 완료</button></div>';
}
function vocabQuiz(){
 const mode=v.mode,graded=Boolean(v.graded[mode]);
 let body="";
 if(mode==="meaning")body=coreIds.map((id,i)=>{const w=d.vocabulary[id],choice=distractors(id),selected=v.answers["meaning"+i];return '<div class="vquizquestion"><h4>'+(i+1)+'. '+E(w.term)+'의 의미는?</h4><div class="options">'+choice.options.map((vocabIndex,j)=>'<button class="option '+(selected===j?"selected ":"")+(graded&&j===choice.correct?"correct":"")+'" data-vmeaning="'+i+'" data-vchoice="'+j+'"><span class="letter">'+("ABCD"[j])+'</span>'+E(d.vocabulary[vocabIndex].meaning)+'</button>').join("")+'</div>'+(graded?'<div class="explain">정답: '+("ABCD"[choice.correct])+' · '+E(w.example)+'</div>':"")+'</div>';}).join("");
 if(mode==="cloze")body=coreIds.map((id,i)=>{const w=d.vocabulary[id],value=v.answers["cloze"+i]||"";return '<div class="vquizquestion"><h4>'+(i+1)+'. Complete the phrase.</h4><p class="vquoted">'+E(w.example.replace(w.term,"______"))+'</p><input class="inputline" data-vcloze="'+i+'" value="'+E(value)+'" placeholder="누락된 단어 또는 표현" autocomplete="off">'+(graded?'<div class="explain">정답: '+E(w.term)+'</div>':"")+'</div>';}).join("");
 if(mode==="writing")body=[2,8,14,20,26].map((id,i)=>{const w=d.vocabulary[id],value=v.answers["writing"+i]||"";return '<div class="vquizquestion"><h4>'+(i+1)+'. Target: '+E(w.term)+'</h4><p>'+E(w.term)+'을 포함한 10단어 이상의 학술 문장을 작성하세요.</p><textarea data-vwrite="'+i+'" style="min-height:90px">'+E(value)+'</textarea>'+(graded?'<div class="explain">모범 예문: '+E(w.example)+'</div>':"")+'</div>';}).join("");
 let score=0;
 if(graded){const ix=mode==="meaning"?coreIds:mode==="cloze"?coreIds:[2,8,14,20,26];ix.forEach((id,i)=>{if(vocabCorrect(mode,id,i))score++;});}
 return '<div class="vsection-head"><h3>Vocabulary Test</h3><span class="pill gold">연습용 자동검사</span></div><div class="vquizmodes">'+[["meaning","뜻 선택 · 10문항"],["cloze","문맥 빈칸 · 10문항"],["writing","영작 · 5문항"]].map(([k,t])=>'<button class="vfilter '+(mode===k?"selected":"")+'" data-vmode="'+k+'">'+t+'</button>').join("")+'</div>'+body+'<div class="answerbar"><span class="status">'+(graded?'점검 결과 '+score+'/'+(mode==="writing"?5:10):"모든 문항을 작성한 후 점검")+'</span><button class="btn" data-vgrade="'+mode+'">채점·정답·해설</button></div><p class="note">영작은 목표 표현 사용 및 10단어 이상만 기계적으로 검사합니다. 문법과 내용의 수준은 직접 검토하세요.</p>';
}
function vocabCorrect(mode,id,i){
 if(mode==="meaning")return v.answers["meaning"+i]===distractors(id).correct;
 if(mode==="cloze")return normalize(v.answers["cloze"+i])===normalize(d.vocabulary[id].term);
 const text=String(v.answers["writing"+i]||"").trim();return normalize(text).includes(normalize(d.vocabulary[id].term)) && text.split(/\s+/).filter(Boolean).length>=10;
}
function vocabReview(){
 const ids=Object.keys(v.misses).map(Number).filter(i=>v.misses[i]&&d.vocabulary[i]);
 return '<div class="vsection-head"><h3>Targeted Mistake Review</h3><span class="pill gold">복습 대상 '+ids.length+'개</span></div>'+(ids.length?ids.map(i=>{const w=d.vocabulary[i];return '<div class="vquizquestion"><h4>'+E(w.term)+'</h4><p>'+E(w.meaning)+' · '+E(w.example)+'</p><button class="btn ghost" data-clear-miss="'+i+'">✓ 확인 완료 · 오답에서 제외</button></div>';}).join(""):'<div class="vempty">현재 등록된 오답이 없습니다. 단어시험이나 플래시카드를 풀어보세요.</div>')+'<h3 class="blocktitle">나만의 오답 노트</h3><textarea data-vnotes="1" style="min-height:115px" placeholder="헷갈렸던 단어와 이유 기록">'+E(v.notes||"")+'</textarea>';
}
function vocabulary(){
 const known=Object.keys(v.known).filter(k=>v.known[k]).length,wrong=Object.keys(v.misses).filter(k=>v.misses[k]).length;
 return panel(head("Vocabulary Lab","단어장 · 플래시카드 · 단어시험 · 오답복습","4-IN-1")+
 '<div class="grid3 vsummary"><div class="kpi"><small>C1–C2 어휘</small><strong>30</strong><p>해당 Day 주제와 학술 표현</p></div><div class="kpi"><small>암기 완료</small><strong>'+known+'/30</strong></div><div class="kpi"><small>복습 필요</small><strong>'+wrong+'</strong></div></div><div class="vtabbar">'+[["wordbook","01 단어장"],["flash","02 플래시카드"],["quiz","03 단어 시험"],["mistakes","04 오답 복습"]].map(([tab,label])=>'<button class="vtab '+(v.tab===tab?"active":"")+'" data-vtab="'+tab+'">'+label+'</button>').join("")+'</div><div class="vtabcontent">'+(v.tab==="wordbook"?vocabBook():v.tab==="flash"?vocabFlash():v.tab==="quiz"?vocabQuiz():vocabReview())+"</div>");
}
function review(){
 const p=progress();
 return panel(head("학습 기록 및 복습","저장된 답변·학습 진도·오답 복습","REVIEW")+
 '<div class="grid3"><div class="kpi"><small>학습 진도</small><strong>'+p.percent+'%</strong></div><div class="kpi"><small>누적 학습 시간</small><strong>'+clock()+'</strong></div><div class="kpi"><small>어휘 오답</small><strong>'+Object.values(v.misses).filter(Boolean).length+'</strong></div></div>'+
 '<div class="toolbar"><button class="btn" data-export="1">↓ 학습 답안 TXT로 내보내기</button><button class="btn ghost" data-reset="1">↺ 이 Day 답안 초기화</button></div>'+
 '<div class="note">학습 답안은 현재 브라우저에 저장됩니다. 초기화 전에 TXT 파일로 내보내면 복습 기록을 보관할 수 있습니다. 초기화하면 해당 Day의 답안·오답·시간이 삭제됩니다.</div>');
}
function render(){
 sidebar();
 const page={overview,reading,listening,speaking,writing,vocab:vocabulary,review}[s.page]||overview;
 document.getElementById("view").innerHTML=page();
 document.getElementById("clock").textContent=clock();
}
function say(text){
 if(!("speechSynthesis" in window)){toast("이 브라우저는 음성합성을 지원하지 않습니다.");return;}
 speechSynthesis.cancel();
 const sentence=String(text||"").replace(/\s+/g," ").match(/[^.!?]+[.!?]*/g)||[];
 for(const segment of sentence){if(!segment.trim())continue;const utter=new SpeechSynthesisUtterance(segment.trim());utter.lang="en-US";utter.rate=.9;speechSynthesis.speak(utter);}
}
function exportTxt(){
 const lines=["TOEFL 110+ Day "+d.day+" | "+d.theme,"다운로드: "+new Date().toLocaleString("ko-KR"),"학습 시간: "+clock(),""];
 for(const [group,items] of Object.entries(d.questions)){lines.push("["+group+"]");items.forEach((q,i)=>{const answer=s.choices[group+"-"+i];lines.push((i+1)+". "+q.q+" / "+(answer===undefined?"미응답":q.options[answer]));});}
 lines.push("Writing Email:",s.writing.email||"", "Academic Discussion:",s.writing.discussion||"", "Vocabulary notes:",v.notes||"");
 const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="TOEFL_Day_"+String(d.day).padStart(2,"0")+"_answers.txt";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function clearDay(){
 if(!confirm("Day "+d.day+"의 답안, 오답, 암기 기록 및 학습 시간을 모두 초기화할까요?\n복구할 수 없습니다. 먼저 답변을 TXT로 내보내세요."))return;
 try{localStorage.removeItem(key);}catch(e){alert("저장소에 접근할 수 없습니다.");return;}
 s=init();v=s.vocab;render();toast("Day "+d.day+"의 답안을 초기화했습니다.");
}
document.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;const a=b.dataset;
 if(a.nav){s.page=a.nav;save();render();window.scrollTo({top:0,behavior:"smooth"});return;}
 if(a.grade){s.graded[a.grade]=true;save();render();return;}
 if(a.choose!==undefined){s.choices[a.choose]=Number(a.value);const group=a.choose.split("-")[0];s.graded[group]=false;save();render();return;}
 if(a.reveal){s.shown[a.reveal]=!s.shown[a.reveal];save();render();return;}
 if(a.speak){say(d.audio[a.speak]);return;}
 if(a.repeat!==undefined){say(d.speaking.repeat[Number(a.repeat)]);return;}
 if(a.timer!==undefined || b.id==="timerBtn"){s.timerOn=!s.timerOn;save();render();return;}
 if(a.reset!==undefined||b.id==="resetTop"){clearDay();return;}
 if(a.export!==undefined||b.id==="saveBtn"){exportTxt();return;}
 if(a.vtab){v.tab=a.vtab;save();render();return;}
 if(a.vmode){v.mode=a.vmode;save();render();return;}
 if(a.known!==undefined){const i=Number(a.known);if(v.known[i])delete v.known[i];else{v.known[i]=true;delete v.misses[i];}save();render();return;}
 if(a.forget!==undefined){const i=Number(a.forget);v.misses[i]=true;delete v.known[i];save();render();return;}
 if(a.sayword!==undefined){const w=d.vocabulary[Number(a.sayword)];if(w)say(w.term+". "+w.example);return;}
 if(a.flip!==undefined){v.flipped=!v.flipped;save();render();return;}
 if(a.card!==undefined){v.card=Math.min(29,Math.max(0,v.card+Number(a.card)));v.flipped=false;save();render();return;}
 if(a.vmeaning!==undefined){v.answers["meaning"+a.vmeaning]=Number(a.vchoice);v.graded.meaning=false;save();render();return;}
 if(a.vgrade){const mode=a.vgrade,ids=mode==="writing"?[2,8,14,20,26]:coreIds;v.graded[mode]=true;ids.forEach((id,i)=>{if(!vocabCorrect(mode,id,i)){v.misses[id]=true;delete v.known[id];}});save();render();return;}
 if(a.clearMiss!==undefined){delete v.misses[Number(a.clearMiss)];save();render();return;}
});
document.addEventListener("input",e=>{
 const el=e.target,a=el.dataset;if(a.cloze!==undefined){s.cloze[a.cloze]=el.value;s.graded.cloze=false;}
 else if(a.build!==undefined){s.build[a.build]=el.value;s.graded.build=false;}
 else if(a.writing){s.writing[a.writing]=el.value;}
 else if(a.interview!==undefined){s.interview[a.interview]=el.value;}
 else if(a.vcloze!==undefined){v.answers["cloze"+a.vcloze]=el.value;v.graded.cloze=false;}
 else if(a.vwrite!==undefined){v.answers["writing"+a.vwrite]=el.value;v.graded.writing=false;}
 else if(a.vnotes!==undefined){v.notes=el.value;}
 else return;
 save();
});
document.addEventListener("change",e=>{const a=e.target.dataset;if(a.tick){s.checks[a.tick]=e.target.checked;save();}});
setInterval(()=>{if(s.timerOn){s.elapsed++;document.getElementById("clock").textContent=clock();if(s.elapsed%10===0)save();}},1000);
render();
})();
