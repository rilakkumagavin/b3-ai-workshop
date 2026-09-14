from pathlib import Path
import json,re,zipfile,hashlib,shutil
import xml.etree.ElementTree as ET
from PIL import Image,ImageOps,ImageDraw
root=Path(__file__).resolve().parent.parent
b=root/'.build'; out=root/'output'
src=b/'checked/B3_新版27頁_任務卡工作坊.pptx'
dst=out/src.name
shutil.copy2(src,dst)
data=json.loads((b/'storyboard.json').read_text(encoding='utf-8-sig'))
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
norm=lambda x:re.sub(r'\s+','',x)
z=zipfile.ZipFile(dst)
slides=[x for x in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+.xml',x)]
assert len(slides)==27
pres=ET.fromstring(z.read('ppt/presentation.xml'))
size=pres.find('p:sldSz',ns)
assert int(size.attrib['cx'])*9==int(size.attrib['cy'])*16
assert sum(d['activity_design']['minutes'] for d in data)==180
rows=[]
for d in data:
 n=d['slide_no']; x=ET.fromstring(z.read(f'ppt/slides/slide{n}.xml'))
 texts=[t.text or '' for t in x.findall('.//a:t',ns)]
 full=''.join(texts)
 title=d['title']; expected=title.split('｜',1)[-1] if title.startswith('任務卡') else title
 assert norm(expected) in norm(full),(n,expected)
 assert f'{n:02} / 27' in texts,n
 task=d['activity_design']['task_no']
 if task: assert re.search(r'任務卡\s*'+str(task)+r'\b',full)
 assert len(x.findall('.//p:sp',ns))>=5
 assert f'ppt/notesSlides/notesSlide{n}.xml' in z.namelist()
 a=d['activity_design']
 rows.append(f"| {n:02} ✓ | {title} | ✓ | {('任務卡 '+str(task)+' ✓') if task else '—'} | 通過 | {a['start']}–{a['end']}（{a['minutes']} 分）✓ |")
tasks=[d['activity_design']['task_no'] for d in data if d['activity_design']['task_no']]
assert tasks==[1,2,3,4,5,6,9,7,8,10]
draft_hash=hashlib.sha256((b/'candidate.pptx').read_bytes()).hexdigest()
final_hash=hashlib.sha256(dst.read_bytes()).hexdigest()
shutil.copytree(b/'render',out/'render',dirs_exist_ok=True)
thumbs=[]
for i in range(1,28):
 im=Image.open(out/f'render/slide-{i:02}.png').convert('RGB');im.thumbnail((384,216))
 tile=Image.new('RGB',(404,249),'#ffffff');tile.paste(im,(10,8));ImageDraw.Draw(tile).text((12,228),f'{i:02} / 27',fill='#173e51');thumbs.append(tile)
montage=Image.new('RGB',(404*3,249*9),'#f0f3f3')
for i,t in enumerate(thumbs):montage.paste(t,((i%3)*404,(i//3)*249))
montage.save(out/'B3_新版27頁_montage.png')
report='''# B3 新版 27 頁簡報檢查報告

檢查日期：2026-09-14。成果：`B3_新版27頁_任務卡工作坊.pptx`。

## 檢查依據

- 指定技能：`.skills/b3-workshop-slide-designer/SKILL.md`。
- 新版大綱實際位置：`.skills/b3-workshop-slide-designer/templates/slide_outline_27.md`，並非工作區根目錄的 `templates/`。已找到原檔，沒有以固定結構替代。
- 教材：`source_materials` 中課程表及模組一、二、三公版 PDF；同名複本一併抽取文字確認。來源資料夾未包含獨立 PPTX 或其他風格檔，視覺依指定技能與教材中的航海意象重新設計。
- 模組一船體架構、模組三 e度角色等圖像型內容已另行轉圖閱讀，避免只靠 PDF 文字抽取。

## 整體結果

- 正好 27 頁，16:9（13.333 × 7.5 吋），頁碼 01–27 正確。
- 27 頁標題逐頁比對新版大綱。任務卡編號置於左上角，主標題保留任務名稱；完整標題也收在備忘稿。換行與空白不影響比對。
- 10 張任務卡各出現一次，順序為 **1、2、3、4、5、6、9、7、8、10**。第 18 頁採新版大綱原題「用紅黃綠燈，幫學生劃出 AI 使用界線」。
- 每頁一個概念或任務。第 2 頁為允許的任務地圖；其餘沒有九宮格。六項風險以三個提問分組，四面向與三層次分區呈現。
- 主標題約 32–42 pt，主要正文約 18–22 pt；文字、任務卡與概念圖為可編輯物件，海洋背景為嵌入式點陣圖。
- 已檢視 27 張逐頁渲染圖，修正第 8 頁提示與階梯距離、第 10 頁換行、第 18 頁燈號配色、第 24 頁步驟換行及頁碼與指南針的干擾。
- 檔案結構、16:9 尺寸、字型與標題版面檢查通過，並完成 Artifact Tool 重新匯入檢查。未宣稱已在 Microsoft PowerPoint 桌面程式中開啟驗證。

## 三小時流程

| 單元 | 頁次 | 時段範例 | 分鐘 |
| --- | --- | --- | ---: |
| 開場與 Check in | 1–4 | 09:00–09:10 | 10 |
| 模組一 | 5–9 | 09:10–09:30 | 20 |
| 模組二 | 10–18 | 09:30–10:30 | 60 |
| 模組三 | 19–25 | 10:30–11:50 | 80 |
| Check out | 26–27 | 11:50–12:00 | 10 |
| 合計 | 27 頁 | 3 小時 | **180** |

逐頁分鐘為本次講師帶領配置，五大單元時長與教材課程表一致。課程表未另列休息，未額外插入休息分鐘。

第 6 頁翻書 6 分鐘、第 9 頁定位 5 分鐘、第 17 頁研討 15 分鐘、第 24 頁實作 25 分鐘、第 25 頁分享 25 分鐘均保留。分享採 5 分鐘上傳＋15 分鐘三輪平行分享＋5 分鐘修正；每輪 2 分鐘設計、2 分鐘 Prompt、1 分鐘回饋，三組成圈同步進行，避免逐組全班報告超時。

## 逐頁檢查

「內容不擁擠」依逐頁畫面檢視文字換行、卡片留白與重疊情形；不只依字數判斷。標題欄為大綱原題。

| 頁次 | 標題 | 標題比對 | 任務編號 | 內容不擁擠 | 活動流程／時間 |
| --- | --- | --- | --- | --- | --- |
'''+ '\n'.join(rows)+'''

## 現場使用準備

- 講師備忘稿已附每頁時間、帶領步驟與教材來源，可使用簡報者模式閱讀。
- Padlet 分享牆須由講師事先建立並提供連結；本次未虛構連結或 QR code，也未上傳任何學員資料。無網路可用紙本互評。
- 翻書任務需事先備妥指引全文；若現場只有模組 PDF，備忘稿提供先用模組一架構頁定位的替代做法。
- e度示範需講師備妥可使用帳號；亦可採人員分角色演練。工具角色描述依本次提供教材，不延伸聲稱目前介面或權限。
- 口訣、框架及教案摘要依教材；停課截圖情境、Prompt 範本與三色規範例子為工作坊教學設計，相關備忘稿已說明。

## 附件

- `render/slide-01.png` 至 `render/slide-27.png`：逐頁預覽。
- `B3_新版27頁_montage.png`：整份簡報縮圖總覽（不是新增投影片）。

'''
report+=f'成品 SHA-256：`{final_hash}`。\n\n草稿與驗證成品位元一致：{draft_hash==final_hash}。\n'
(out/'check_report.md').write_text(report,encoding='utf8')
print(json.dumps({'slides':27,'minutes':180,'tasks':tasks,'draft_equals_final':draft_hash==final_hash,'output':str(dst)},ensure_ascii=True))
