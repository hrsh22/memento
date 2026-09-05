"""Render a captioned video visualization of actual captured worker events.
Requires Pillow and imageio-ffmpeg. No browser footage or synthetic transactions.
Original event timestamps are retained; waiting intervals are shortened.
"""
import json, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg
root=Path(__file__).resolve().parent.parent
run=json.loads((root/'public/showcase/run.json').read_text())
out=root/'public/showcase'
W,H=1280,720
bg='#f4f6ed'; ink='#283d2e'; muted='#667952'; green='#d9e6b2'
font_path='/System/Library/Fonts/Avenir Next.ttc'
if not Path(font_path).exists(): font_path='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
mono_path='/System/Library/Fonts/Menlo.ttc'
if not Path(mono_path).exists(): mono_path=font_path
def font(n,mono=False):return ImageFont.truetype(mono_path if mono else font_path,n)
def text(draw,xy,content,n=24,color=ink,width=None,spacing=9):
    lines=textwrap.wrap(content,width=width,break_long_words=True,break_on_hyphens=False) if width else content.split('\n')
    y=xy[1]
    for line in lines:draw.text((xy[0],y),line,font=font(n),fill=color);y+=n+spacing
    return y
def base():
    im=Image.new('RGB',(W,H),bg);d=ImageDraw.Draw(im)
    for i,(y,h) in enumerate([(37,28),(32,20),(45,20),(29,33)]):
        d.rounded_rectangle((55+i*11,y,61+i*11,y+h),2,fill=ink)
    text(d,(111,25),'memento.',36)
    text(d,(715,40),'RECORDED CALIBRATION RUN',15,muted)
    d.line((55,90,1225,90),fill='#dbe3d0',width=1)
    text(d,(55,682),'memento-sigma-rosy.vercel.app/watch',15,muted)
    return im,d
def intro():
    im,d=base()
    text(d,(60,145),'An agent that\ncan say no.',74,ink,spacing=5)
    text(d,(66,350),'A funded wallet does not override the budget.',28,muted)
    text(d,(66,413),'Real refusals. Two provider copies.\nA spending allowance that remembers.',28,ink)
    d.rounded_rectangle((65,540,1185,618),10,fill=ink)
    text(d,(89,563),'4 decisions  /  1 actual worker run  /  signed evidence',26,green)
    return im
def event_frame(event,i):
    im,d=base()
    phase=next((p for p in reversed(run['phases']) if p['startedAt']<=event['at']),run['phases'][0])
    receipt=next(r for r in run['receipts'] if r['id']==phase['receiptId'])
    text(d,(60,113),event['stage'].upper()+' / '+event['at'][11:19]+' UTC',17,muted)
    y=text(d,(57,160),event['title'],40,ink,width=34,spacing=6)
    text(d,(60,max(275,y+24)),event['detail'],22,muted,width=64,spacing=9)
    d.rounded_rectangle((900,150,1220,555),12,fill=ink)
    text(d,(924,175),'PHASE RECEIPT',15,green)
    rows=[
      ('Wallet at observation',f"{float(receipt['snapshot']['walletUsdfc']):.2f} USDFC"),
      ('Recurring cost cap',str(receipt['plan']['policy']['maxMonthlyUsdfc'])+' / month'),
      ('Quoted archive fee',receipt.get('quote',{}).get('operationFeesUsdfc','0')+' USDFC'),
      ('30-day fee allowance',receipt.get('spending',{}).get('feeLimitUsdfc','0.03')+' USDFC'),
    ]
    for j,(label,value) in enumerate(rows):
        text(d,(924,218+j* seventy),label,15,'#bdcda8')
        text(d,(924,243+j*seventy),value,23,'#f3f6e9')
    text(d,(60,602),'EVENT '+str(i+1).zfill(2)+' / '+str(len(run['events']))+'  ·  Waiting intervals shortened',15,muted)
    for j in range(len(run['events'])):
        x=60+j*52
        d.rounded_rectangle((x,641,x+43,647),3,fill=ink if j<=i else '#dbe3d0')
    return im
seventy=70
def outro():
    im,d=base()
    text(d,(60,142),'Verify the decision.\nThen verify the bytes.',60,ink,spacing=8)
    text(d,(64,330),'One archive stored. A second write refused.\nIdentical input did not trigger another paid upload.',27,muted)
    text(d,(64,437),'Both provider copies were retrieved independently.\nAll four decision receipts carry the agent signature.',26,ink)
    d.rounded_rectangle((60,555,1220,626),10,fill=ink)
    text(d,(87,573),'Explore the app and verify the run yourself.',28,green)
    return im
frames=[(intro(),6.0,'A funded wallet does not override the budget. Four decisions from an actual worker run.')]
for i,event in enumerate(run['events']):
    seconds=4.2 if event['stage'] in ['act','verify','error'] else 3.3
    frames.append((event_frame(event,i),seconds,event['title']+'. '+event['detail']))
frames.append((outro(),9.0,'Verify the recorded run, four signed decisions, and both independently retrieved provider copies.'))
frames[0][0].save(out/'poster.png')
writer=imageio_ffmpeg.write_frames(str(out/'memento-demo.mp4'),(W,H),fps=24,codec='libx264',quality=7,output_params=['-movflags','+faststart','-pix_fmt','yuv420p'])
writer.send(None)
cursor=0.0;vtt=['WEBVTT','']
def timestamp(t):
    ms=round(t*1000);return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}"
for im,seconds,caption in frames:
    count=round(seconds*24);duration=count/24
    vtt += [timestamp(cursor)+' --> '+timestamp(cursor+duration),caption,'']
    data=im.tobytes()
    for _ in range(count):writer.send(data)
    cursor+=duration
writer.close()
(out/'captions.vtt').write_text('\n'.join(vtt))
print(json.dumps({'durationSeconds':cursor,'videoBytes':(out/'memento-demo.mp4').stat().st_size,'events':len(run['events'])}))
