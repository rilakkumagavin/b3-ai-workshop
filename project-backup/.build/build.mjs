import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
process.env.RUNTIME_NODE_MODULES='C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const root=path.resolve('..');
const skill='C:/Users/user/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs'));
const data=JSON.parse(await fs.readFile('content.json','utf8'));
const outline=await fs.readFile(root+'/.skills/b3-workshop-slide-designer/templates/slide_outline_27.md','utf8');
const titles=[...outline.matchAll(/^## Slide \d+｜(.+)$/gm)].map(m=>m[1].trim());
const p=Presentation.create({slideSize:{width:1280,height:720}});
const bg=await fs.readFile('ocean.png');
const C={navy:'#173E51',teal:'#267F84',mint:'#DDF0E7',blue:'#E2F1F7',yellow:'#F9E6AE',pink:'#F5D8CF',paper:'#FCFAF3',muted:'#54717C',white:'#FFFFFF'};
const font='Microsoft JhengHei';
function shape(s,x,y,w,h,fill,geo='roundRect',stroke='none'){return s.shapes.add({geometry:geo,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:stroke==='none'?0:1.3},...(geo === 'roundRect' ? {borderRadius:16} : {})});}
function text(s,v,x,y,w,h,size=28,color=C.navy,bold=false,align='left'){
 const q=shape(s,x,y,w,h,'none','textbox');q.text=v;q.text.style={typeface:font,fontSize:size,color,bold,alignment:align,verticalAlignment:'middle',autoFit:'none',insets:{left:0,right:0,top:0,bottom:0}};return q;
}
function card(s,x,y,w,h,heading,body,fill=C.white){shape(s,x,y,w,h,fill);text(s,heading,x+22,y+18,w-44,42,29,C.navy,true);text(s,body,x+22,y+70,w-44,h-86,26);}
function line(s,x,y,w,color=C.teal){shape(s,x,y,w,3,color,'rect');}
function bottom(s,v){text(s,v,105,578,1070,54,27,C.teal,true,'center');}
let elapsed=0;
const storyboard=[];
for(let i=0;i<data.length;i++){
 const d=data[i],s=p.slides.add(),n=i+1;
 const unit=n<=4?'開場與 Check in':n<=9?'模組一　看懂指引':n<=18?'模組二　看見風險':n<=25?'模組三　教案實作':'Check out　行動收束';
 const tm=`${String(9+Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
 elapsed+=d.min;
 const end=`${String(9+Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
 const match=titles[i].match(/^任務卡 (\d+)｜(.+)$/),task=match?Number(match[1]):null;
 s.images.add({blob:bg,contentType:'image/png',position:{left:0,top:0,width:1280,height:720},alt:'淺色海洋航行背景，底部小船與燈塔',fit:'cover'});
 text(s,task?`任務卡 ${task}　/　${unit}`:unit,54,28,1020,32,21,C.teal,true);
 text(s,`${d.min} 分鐘`,1100,28,126,32,21,C.teal,true,'right');
 text(s,String(n).padStart(2,'0')+' / 27',1030,663,98,28,18,C.navy,false,'right');
 if(d.kind==='cover'||d.kind==='closing'){
  shape(s,44,85,1192,487,C.navy);
  const headline=d.kind==='cover'?'邁向「以人為中心」的\nAI 賦能教學':'攜手同行：\n開創以人為中心的課堂';
  text(s,headline,92,124,1085,155,56,C.white,true);
  text(s,d.sub,94,304,1050,70,27,C.yellow);
  text(s,d.core,94,407,1050,126,35,C.white);
 }else{
  const title=match?match[2]:titles[i];
  text(s,title,54,85,1172,110,title.length>29?43:46,C.navy,true);
  text(s,d.sub,57,203,1166,43,27,C.muted);
  if(d.kind==='map'){
   const xs=[64,300,536,772,1008];
   line(s,150,327,970);line(s,150,475,970);shape(s,1115,327,3,151,C.teal,'rect');
   d.items.forEach((a,j)=>{const col=j<5?j:9-j,x=xs[col],y=j<5?268:416;shape(s,x,y,208,117,[C.blue,C.mint,C.yellow,C.pink][j%4]);text(s,a[0],x+14,y+8,44,43,31,C.teal,true);text(s,a[1],x+16,y+59,180,42,27,C.navy,true);});bottom(s,d.core);
  }else if(['task','cards','ports','traffic','risks','share'].includes(d.kind)){
   const count=d.items.length,gap=20,w=(1172-gap*(count-1))/count;
   d.items.forEach((a,j)=>card(s,54+j*(w+gap),282,w,d.kind==='share'?194:260,a[0],a[1],(d.kind==='traffic'?[C.mint,C.yellow,C.pink]:[C.blue,C.mint,C.yellow,C.pink])[j%4]));
   if(d.kind==='share'){text(s,'5 分鐘上傳　＋　15 分鐘平行分享（三輪）　＋　5 分鐘修正',65,503,1150,47,27,C.teal,true,'center');}bottom(s,d.core);
  }else if(['two','cases'].includes(d.kind)){
   d.items.forEach((a,j)=>card(s,54+j*596,282,576,269,a[0],a[1],j?C.mint:C.blue));bottom(s,d.core);
  }else if(d.kind==='think'){
   line(s,143,368,984);
   d.items.forEach((a,j)=>{const x=54+j*238;shape(s,x,290,220,240,[C.blue,C.mint,C.yellow,C.pink,C.blue][j]);text(s,a[0],x+30,309,160,92,68,C.teal,true,'center');text(s,a[1],x+10,433,200,60,32,C.navy,true,'center');});bottom(s,d.core);
  }else if(d.kind==='framework'){
   d.items.forEach((a,j)=>card(s,54+(j%2)*395,272+Math.floor(j/2)*143,375,126,a[0],a[1],j%2?C.mint:C.blue));
   ['取得理解','深化應用','創造轉型'].forEach((a,j)=>{const yy=451-j*76;shape(s,866+j*20,yy,320-j*20,69,[C.blue,C.mint,C.yellow][j]);text(s,a,885+j*20,yy+10,274-j*20,48,28,C.navy,true,'center');});
   text(s,'三層次，逐步前進',853,256,368,39,25,C.teal,true);bottom(s,'圈一個面向，再找自己的下一步。');
  }else if(d.kind==='boat'){
   // Editable conceptual boat diagram explicitly requested by B3 design skill.
   shape(s,315,285,7,181,C.navy,'rect');shape(s,168,292,140,152,C.yellow,'rtTriangle');shape(s,330,313,172,131,C.pink,'rtTriangle');shape(s,145,458,405,69,C.blue,'trapezoid');shape(s,322,526,12,40,C.teal,'rect');
   d.items.forEach((a,j)=>{const yy=264+j*103;line(s,570,yy+42,50);shape(s,641,yy,580,95,[C.yellow,C.blue,C.mint][j]);text(s,a[0]+'　'+a[1].split('\n')[0],663,yy+8,536,39,29,C.navy,true);text(s,a[1].split('\n')[1],663,yy+50,536,36,26);});bottom(s,d.core);
  }else if(d.kind==='loop'){
   d.items.forEach((a,j)=>{const x=54+j*299;card(s,x,294,274,226,a[0],a[1],[C.blue,C.mint,C.yellow,C.pink][j]);if(j<3)text(s,'›',x+274,365,25,47,35,C.teal,true,'center');});line(s,158,550,970);shape(s,158,520,3,33,C.teal,'rect');shape(s,1125,520,3,33,C.teal,'rect');shape(s,502,536,276,36,C.paper);text(s,'回看與調整',504,534,272,39,24,C.teal,true,'center');bottom(s,d.core);
  }else if(d.kind==='venn'){
   shape(s,372,271,294,210,C.blue,'ellipse');shape(s,552,271,294,210,C.mint,'ellipse');shape(s,461,385,294,180,C.yellow,'ellipse');
   text(s,'AI 技術',392,297,207,55,31,C.navy,true,'center');text(s,'教學法',641,297,184,55,31,C.navy,true,'center');text(s,'學科內容',507,480,205,53,31,C.navy,true,'center');text(s,'AI 賦能\n學習',534,372,161,98,31,C.teal,true,'center');
   text(s,'能提供什麼協助？',55,340,294,70,27);text(s,'學生怎麼練習？',874,340,352,70,27);bottom(s,d.core);
  }else if(d.kind==='prompt'){
   d.items.forEach((a,j)=>{const yy=278+j*88;shape(s,54,yy,395,74,[C.blue,C.mint,C.yellow][j]);text(s,a[0],73,yy+12,106,50,25,C.navy,true);text(s,a[1],181,yy+8,249,58,24,C.navy,true);});
   shape(s,475,278,750,274,C.white);text(s,'可以直接改寫的 Prompt',503,295,693,43,28,C.teal,true);text(s,d.core,503,359,691,177,29);bottom(s,'帶走：原版＋修正版 Prompt、一段對話、學習證據。');
  }
 }
 const note=`${titles[i]}\n時間：${tm}–${end}（${d.min} 分鐘）\n\n${d.notes}\n\n教材來源：${d.src}\n背景：OpenAI imagegen 生成海洋教學背景，2026-09-14。`;
 s.speakerNotes.textFrame.setText(note);
 storyboard.push({slide_no:n,unit,title:titles[i],subtitle:d.sub,on_slide_text:[...(d.items??[]).flat(),d.core],speaker_notes:note,activity_design:{minutes:d.min,start:tm,end,task_no:task},visual_design:d.kind});
}
await fs.writeFile('storyboard.json',JSON.stringify(storyboard,null,2));
await (await PresentationFile.exportPptx(p)).save(path.resolve('candidate.pptx'));
console.log('Exported draft, minutes:',elapsed);
for(let i=0;i<p.slides.items.length;i++){
 const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});
 await fs.writeFile(`render/slide-${String(i+1).padStart(2,'0')}.png`,new Uint8Array(await blob.arrayBuffer()));
 console.log('Rendered',i+1);
}
const result=await finalizePresentation({workspaceDir:root,candidatePath:path.resolve('candidate.pptx'),finalPath:root+'/.build/checked/B3_新版27頁_任務卡工作坊.pptx',pythonExecutable:'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],explicitTotalSlideCount:27,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:[font]},verifyArtifactToolImport:true,receiptPath:path.resolve('validation.json')});
console.log(JSON.stringify(result));



