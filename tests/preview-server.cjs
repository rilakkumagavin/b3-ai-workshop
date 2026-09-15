// Local-only UI fixture. Never publish. Uses the real GAS functions with in-memory Sheets.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {post,props}=require('./backend.cjs');
props.set('ADMIN_ACCESS_KEY','preview-only-access-key-1234567890123456');props.set('WORKSHOP_TITLE','B3 教師 AI 共學工作坊');
for(let i=1;i<=6;i++){
  post('submitParticipant',{participant_id:'sample-'+i,name:'示範夥伴'+i,group_id:String(Math.ceil(i/2))});
  post('submitWordCloud',{participant_id:'sample-'+i,mood:'好奇',keyword:['保留思考','提問設計','教學夥伴'][i%3]});
  post('submitLearningGoal',{participant_id:'sample-'+i,goal:'設計保留思考的 Prompt'});
}
post('submitLessonMarket',{group_id:'1',lesson_title:'用提問讀懂說明文',original_prompt:'請說明這篇課文。',revised_prompt:'一次問我一個問題，請我指出原文依據。',avoid_thinking_replacement:'由學生自行找證據並說明。'});
const root=path.resolve(__dirname,'../dist');
http.createServer((req,res)=>{
  if(req.url==='/test-api'&&req.method==='POST'){let data='';req.on('data',b=>data+=b);req.on('end',()=>{try{const b=JSON.parse(data);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(post(b.action,b.payload,b.token)));}catch{res.writeHead(400);res.end('{}');}});return;}
  const url=new URL(req.url,'http://localhost');const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try{let data=fs.readFileSync(file);const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'})[ext]||'application/octet-stream');
    if(ext==='.html')data=data.toString().replace('<head>','<head><script>const realFetch=window.fetch.bind(window);window.fetch=(url,options)=>realFetch(String(url).startsWith("https://script.google.com/")?"/test-api":url,options);</script>').replace('<body>','<body><p style="margin:0;padding:8px;background:#ffe2a6;color:#173d49;position:relative;z-index:10">本機驗收環境 · 使用模擬試算表，不會寫入正式資料</p>');
    res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(8766,'127.0.0.1',()=>console.log('UI fixture: http://127.0.0.1:8766'));
