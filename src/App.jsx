import { useState, useRef, useCallback } from "react";

const C = {
  bg:'#0c0c18', sidebar:'#10101e', card:'#16162a', border:'#252540',
  accent:'#7c3aed', accentL:'#a78bfa', accentDim:'rgba(124,58,237,0.15)',
  text:'#e2e8f0', muted:'#94a3b8', dim:'#475569',
  success:'#10b981', danger:'#f43f5e', warn:'#f59e0b',
  gold:'#f59e0b', goldDim:'rgba(245,158,11,0.12)'
};

const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const btn = (ex={}) => ({ border:'none', cursor:'pointer', borderRadius:10, fontSize:14, fontWeight:600, transition:'all 0.15s', ...ex });

// 模拟用户数据库（内存）
const USER_DB = [{ email:'demo@voiceclone.ai', password:'demo123', name:'演示用户', avatar:'🎤', plan:'pro' }];

const PLANS = [
  { id:'free', name:'免费版', price:0, unit:'', color:'#475569', features:['3 次声音克隆','每日 500 字生成','标准音质','1 个声音模型'], badge:null },
  { id:'pro', name:'专业版', price:39, unit:'/月', color:C.accent, features:['无限声音克隆','每日 50,000 字生成','高清音质','10 个声音模型','优先处理队列','API 访问权限'], badge:'最受欢迎' },
  { id:'enterprise', name:'企业版', price:199, unit:'/月', color:C.gold, features:['无限声音克隆','无限字生成','专业级音质','无限声音模型','专属客户经理','私有化部署支持','团队协作功能'], badge:'旗舰' },
];

const DEMO_VOICES = [{ id:1, name:'示例声音', dur:'00:28', date:'04/10', emoji:'⭐', color:C.warn }];
const AVATARS = ['🎤','🎵','🌊','✨','🔥','🎶','🎸','🎹','🎺','🎻'];

// ───────── 小组件 ─────────
function ProgressBar({ pct }) {
  return <>
    <div style={{ background:'#0a0a16', borderRadius:100, height:6, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${C.accent},${C.accentL})`, borderRadius:100, transition:'width 0.2s' }}/>
    </div>
    <div style={{ fontSize:11, color:C.dim, marginTop:6 }}>{Math.round(pct)}%</div>
  </>;
}
function Card({ children, style={} }) {
  return <div style={{ background:C.card, borderRadius:14, padding:22, border:`1px solid ${C.border}`, ...style }}>{children}</div>;
}
function BigBtn({ children, onClick, bg, col, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ width:'100%', padding:11, borderRadius:10, background:disabled?C.border:bg||`linear-gradient(135deg,${C.accent},#4f46e5)`, color:disabled?C.dim:col||'#fff', border:'none', cursor:disabled?'not-allowed':'pointer', fontSize:14, fontWeight:600 }}>{children}</button>;
}
function Input({ label, type='text', value, onChange, placeholder, error, right }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <div style={{ fontSize:12, color:C.muted, marginBottom:6, fontWeight:500 }}>{label}</div>}
      <div style={{ position:'relative' }}>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width:'100%', padding:'11px 14px', paddingRight:right?42:14, borderRadius:10, background:'#0a0a16', border:`1.5px solid ${error?C.danger:C.border}`, color:C.text, fontSize:14, boxSizing:'border-box', fontFamily:'inherit' }}/>
        {right && <span style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', cursor:'pointer', fontSize:16 }}>{right}</span>}
      </div>
      {error && <div style={{ fontSize:11, color:C.danger, marginTop:5 }}>⚠ {error}</div>}
    </div>
  );
}

// ───────── 登录/注册页 ─────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [avatar] = useState(AVATARS[Math.floor(Math.random()*AVATARS.length)]);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = '请输入邮箱';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = '邮箱格式不正确';
    if (mode !== 'forgot') {
      if (!pw) e.pw = '请输入密码';
      else if (pw.length < 6) e.pw = '密码至少 6 位';
    }
    if (mode === 'register') {
      if (!name.trim()) e.name = '请输入昵称';
      if (pw !== pw2) e.pw2 = '两次密码不一致';
      if (USER_DB.find(u => u.email === email)) e.email = '该邮箱已被注册';
    }
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => {
      if (mode === 'forgot') { setForgotSent(true); setLoading(false); return; }
      if (mode === 'register') {
        const newUser = { email, password:pw, name:name.trim(), avatar, plan:'free' };
        USER_DB.push(newUser);
        setLoading(false); onLogin(newUser);
      } else {
        const user = USER_DB.find(u => u.email===email && u.password===pw);
        setLoading(false);
        if (user) onLogin(user);
        else setErrors({ form:'邮箱或密码错误，请重试' });
      }
    }, 900);
  };

  const fillDemo = () => { setEmail('demo@voiceclone.ai'); setPw('demo123'); setErrors({}); };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <style>{`input:focus{outline:none;border-color:${C.accent}!important} @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>

      <div style={{ width:'100%', maxWidth:420, animation:'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${C.accent},#4f46e5)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 12px' }}>🎙</div>
          <div style={{ fontSize:22, fontWeight:700 }}>VoiceClone AI</div>
          <div style={{ fontSize:13, color:C.dim, marginTop:4 }}>声音克隆与语音合成平台</div>
        </div>

        <Card>
          {/* Tabs */}
          {mode !== 'forgot' && (
            <div style={{ display:'flex', background:'#0a0a16', borderRadius:10, padding:3, marginBottom:24 }}>
              {[['login','登录'],['register','注册']].map(([m,lbl])=>(
                <button key={m} onClick={()=>{setMode(m);setErrors({});}} style={{ ...btn(), flex:1, padding:'8px', borderRadius:8, background:mode===m?C.card:'transparent', color:mode===m?C.text:C.dim, fontSize:13 }}>{lbl}</button>
              ))}
            </div>
          )}

          {/* 找回密码 */}
          {mode === 'forgot' && (
            <div style={{ marginBottom:20 }}>
              <button onClick={()=>{setMode('login');setForgotSent(false);setErrors({});}} style={{ ...btn(), background:'transparent', color:C.dim, padding:'4px 0', fontSize:13 }}>← 返回登录</button>
              <div style={{ fontSize:16, fontWeight:700, marginTop:8 }}>找回密码</div>
              <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>输入注册邮箱，我们将发送重置链接</div>
            </div>
          )}

          {forgotSent ? (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📬</div>
              <div style={{ fontWeight:600, marginBottom:6 }}>重置邮件已发送</div>
              <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>请检查 <strong style={{color:C.accentL}}>{email}</strong> 的收件箱，点击邮件中的链接重置密码。</div>
              <button onClick={()=>{setMode('login');setForgotSent(false);}} style={{ ...btn(), marginTop:18, padding:'9px 20px', background:C.accentDim, color:C.accentL, border:`1px solid ${C.accent}44` }}>返回登录</button>
            </div>
          ) : <>
            {errors.form && (
              <div style={{ background:'rgba(244,63,94,0.1)', border:`1px solid ${C.danger}44`, borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13, color:C.danger }}>⚠ {errors.form}</div>
            )}

            {mode === 'register' && <Input label="昵称" value={name} onChange={e=>setName(e.target.value)} placeholder="你的显示名称" error={errors.name}/>}

            <Input label="邮箱" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" error={errors.email}/>

            {mode !== 'forgot' && (
              <Input label="密码" type={showPw?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
                placeholder={mode==='register'?'至少 6 位':'请输入密码'} error={errors.pw}
                right={<span onClick={()=>setShowPw(v=>!v)} style={{ color:C.dim, userSelect:'none' }}>{showPw?'🙈':'👁'}</span>}/>
            )}

            {mode === 'register' && (
              <Input label="确认密码" type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="再次输入密码" error={errors.pw2}/>
            )}

            {mode === 'login' && (
              <div style={{ textAlign:'right', marginTop:-8, marginBottom:16 }}>
                <button onClick={()=>{setMode('forgot');setErrors({});}} style={{ ...btn(), background:'transparent', color:C.accentL, fontSize:12, padding:0, fontWeight:400 }}>忘记密码？</button>
              </div>
            )}

            <button onClick={submit} disabled={loading} style={{ ...btn(), width:'100%', padding:'13px', background:loading?C.border:`linear-gradient(135deg,${C.accent},#4f46e5)`, color:loading?C.dim:'#fff', fontSize:15, marginTop:4, cursor:loading?'not-allowed':'pointer' }}>
              {loading ? '处理中...' : mode==='login'?'登录':mode==='register'?'创建账户':'发送重置邮件'}
            </button>

            {mode === 'login' && (
              <button onClick={fillDemo} style={{ ...btn(), width:'100%', padding:'11px', background:'transparent', color:C.muted, border:`1px solid ${C.border}`, fontSize:13, marginTop:10 }}>
                🎯 使用演示账号体验
              </button>
            )}
          </>}

          {mode !== 'forgot' && (
            <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}`, textAlign:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ flex:1, height:1, background:C.border }}/>
                <span style={{ fontSize:12, color:C.dim }}>或使用第三方登录</span>
                <div style={{ flex:1, height:1, background:C.border }}/>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                {[['微信','#07C160','🟢'],['QQ','#12B7F5','🔵'],['GitHub','#e2e8f0','⚫']].map(([lbl,col,ic])=>(
                  <button key={lbl} onClick={()=>alert(`${lbl} 第三方登录演示`)} style={{ ...btn(), flex:1, padding:'9px 8px', background:'#0a0a16', border:`1px solid ${C.border}`, color:C.muted, fontSize:12 }}>
                    {ic} {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div style={{ textAlign:'center', fontSize:11, color:C.dim, marginTop:16 }}>
          登录即代表同意《服务条款》和《隐私政策》<br/>© 2026 VoiceClone AI · 数据安全加密存储
        </div>
      </div>
    </div>
  );
}

// ───────── 用户头像下拉 ─────────
function UserMenu({ user, onLogout, onProfile }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:10, cursor:'pointer', background:open?C.accentDim:'transparent', border:`1px solid ${open?C.accent+'55':'transparent'}` }}>
        <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${C.accent},#4f46e5)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{user.avatar}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
          <div style={{ fontSize:10, color:C.dim, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
        </div>
        <span style={{ color:C.dim, fontSize:10 }}>{open?'▲':'▼'}</span>
      </div>
      {open && (
        <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:0, right:0, background:C.sidebar, border:`1px solid ${C.border}`, borderRadius:12, overflow:'hidden', zIndex:100 }}>
          <button onClick={()=>{onProfile();setOpen(false);}} style={{ ...btn(), width:'100%', textAlign:'left', padding:'11px 14px', background:'transparent', color:C.muted, borderRadius:0, fontSize:13, fontWeight:400, display:'flex', alignItems:'center', gap:8 }}>
            👤 个人资料
          </button>
          <div style={{ height:1, background:C.border }}/>
          <button onClick={()=>{onLogout();setOpen(false);}} style={{ ...btn(), width:'100%', textAlign:'left', padding:'11px 14px', background:'transparent', color:C.danger, borderRadius:0, fontSize:13, fontWeight:400, display:'flex', alignItems:'center', gap:8 }}>
            🚪 退出登录
          </button>
        </div>
      )}
    </div>
  );
}

// ───────── 个人资料页 ─────────
function ProfilePage({ user, setUser }) {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar);

  const save = () => {
    const u = USER_DB.find(u=>u.email===user.email);
    if (u) { u.name=name; u.avatar=avatar; }
    setUser({...user, name, avatar});
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div style={{ padding:32, maxWidth:560 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>个人资料</h1>
        <p style={{ margin:'6px 0 0', color:C.muted, fontSize:14 }}>管理你的账户信息</p>
      </div>
      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.muted, marginBottom:16 }}>选择头像</div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
          {AVATARS.map(a=>(
            <button key={a} onClick={()=>setAvatar(a)} style={{ ...btn(), width:44, height:44, fontSize:22, background:avatar===a?C.accentDim:'#0a0a16', border:`2px solid ${avatar===a?C.accent:C.border}` }}>{a}</button>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px', background:'#0a0a16', borderRadius:10 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:`linear-gradient(135deg,${C.accent},#4f46e5)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{avatar}</div>
          <div>
            <div style={{ fontWeight:600 }}>{name||'未命名'}</div>
            <div style={{ fontSize:12, color:C.dim }}>{user.email}</div>
          </div>
        </div>
      </Card>
      <Card style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:C.muted, marginBottom:16 }}>账户信息</div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>昵称</div>
          <input value={name} onChange={e=>setName(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:8, background:'#0a0a16', border:`1.5px solid ${C.border}`, color:C.text, fontSize:14, boxSizing:'border-box' }}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>邮箱</div>
          <div style={{ padding:'10px 12px', borderRadius:8, background:'#0a0a16', border:`1.5px solid ${C.border}`, fontSize:14, color:C.dim }}>{user.email} <span style={{ fontSize:11, color:C.success, marginLeft:6 }}>✓ 已验证</span></div>
        </div>
        <button onClick={save} style={{ ...btn(), padding:'11px 24px', background:`linear-gradient(135deg,${C.accent},#4f46e5)`, color:'#fff' }}>
          {saved ? '✅ 已保存' : '保存修改'}
        </button>
      </Card>
      <Card>
        <div style={{ fontSize:13, fontWeight:600, color:C.muted, marginBottom:12 }}>账户安全</div>
        <button onClick={()=>alert('密码修改邮件已发送（演示）')} style={{ ...btn(), padding:'9px 16px', background:'transparent', color:C.muted, border:`1px solid ${C.border}`, fontSize:13 }}>🔑 修改密码</button>
        <div style={{ marginTop:10, fontSize:11, color:C.dim }}>最后登录：{new Date().toLocaleString('zh')}</div>
      </Card>
    </div>
  );
}

// ───────── 其余子组件 ─────────
function WaveBox({ recState, recUrl, clonePct, canvasRef }) {
  return (
    <div style={{ background:'#0a0a16', borderRadius:10, height:80, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
      {recState==='idle' && <span style={{ color:C.dim, fontSize:12 }}>点击录音按钮开始</span>}
      <canvas ref={canvasRef} width={500} height={80} style={{ width:'100%', height:'100%', display:recState==='recording'?'block':'none' }}/>
      {recState==='preview' && <audio src={recUrl} controls style={{ width:'calc(100% - 16px)', filter:'invert(0.85) hue-rotate(180deg)' }}/>}
      {(recState==='cloning'||recState==='done') && (
        <div style={{ width:'calc(100% - 24px)' }}>
          {recState==='done' ? <div style={{ textAlign:'center', color:C.success, fontSize:20 }}>✅</div> : <ProgressBar pct={clonePct}/>}
        </div>
      )}
    </div>
  );
}

function UploadBox({ upFile, setUpFile, upState, setUpState, upClonePct, fileRef }) {
  const [drag, setDrag] = useState(false);
  const onDrop = e => { e.preventDefault(); setDrag(false); const f=e.dataTransfer.files[0]; if(f&&/\.(mp3|wav|m4a|ogg|flac)$/i.test(f.name)){setUpFile(f);setUpState('idle');} };
  if (upState==='cloning'||upState==='done') return (
    <div style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
      <div style={{ width:'calc(100% - 8px)' }}>
        {upState==='done' ? <div style={{ textAlign:'center', color:C.success, fontSize:20 }}>✅</div> : <ProgressBar pct={upClonePct}/>}
      </div>
    </div>
  );
  return <>
    <div onDrop={onDrop} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onClick={()=>fileRef.current?.click()} style={{ border:`2px dashed ${drag||upFile?C.accent:C.border}`, borderRadius:10, height:80, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', marginBottom:14, background:drag||upFile?C.accentDim:'transparent', transition:'all 0.15s' }}>
      {upFile ? <>
        <div style={{ fontSize:13, color:C.accentL, fontWeight:600, padding:'0 12px', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>{upFile.name}</div>
        <div style={{ fontSize:11, color:C.dim }}>{(upFile.size/1024).toFixed(0)} KB · 点击更换</div>
      </> : <>
        <div style={{ fontSize:20, marginBottom:4 }}>📂</div>
        <div style={{ fontSize:12, color:C.dim }}>拖拽或点击上传音频</div>
      </>}
    </div>
    <input ref={fileRef} type="file" accept="audio/*" style={{ display:'none' }} onChange={e=>{setUpFile(e.target.files[0]);setUpState('idle');}}/>
  </>;
}

function QRPattern({ method }) {
  const color = method==='alipay'?'#1677FF':'#07C160';
  const cells = [];
  const seed = method==='alipay'?42:73;
  const pseudo = (i,j) => ((i*7+j*13+seed)%3===0||(i===0||i===6||j===0||j===6)||(i>=1&&i<=2&&j>=1&&j<=2)||(i>=4&&i<=5&&j>=4&&j<=5));
  for (let i=0;i<12;i++) for (let j=0;j<12;j++) { if(pseudo(i,j)) cells.push(<rect key={`${i}-${j}`} x={j*13} y={i*13} width={11} height={11} rx={1.5} fill={color}/>); }
  return <svg width="156" height="156" viewBox="0 0 156 156">{cells}<text x={78} y={84} textAnchor="middle" fill={color} fontSize={11} fontWeight={700}>{method==='alipay'?'支付宝':'微信'}</text></svg>;
}

function PaymentModal({ plan, onClose, onSuccess }) {
  const [method, setMethod] = useState('alipay');
  const [step, setStep] = useState('choose');
  const [countdown, setCountdown] = useState(300);
  const [orderId] = useState('VC' + Date.now());
  const timerRef=useRef(null); const pollRef=useRef(null);
  const startTimer = () => { timerRef.current=setInterval(()=>setCountdown(c=>{if(c<=1){clearInterval(timerRef.current);return 0;}return c-1;}),1000); };
  const goQR = () => { setStep('requesting'); setTimeout(()=>{setStep('qr');startTimer();},1200); };
  const simPay = () => { clearInterval(timerRef.current); setStep('polling'); let n=0; pollRef.current=setInterval(()=>{n++;if(n>=3){clearInterval(pollRef.current);setStep('success');setTimeout(()=>onSuccess(plan),1200);}},600); };
  const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
  const modal = { background:C.card, borderRadius:18, border:`1px solid ${C.border}`, width:380, maxWidth:'calc(100vw - 32px)', padding:28, position:'relative' };
  const METHODS = [
    { id:'alipay', label:'支付宝', color:'#1677FF' },
    { id:'wechat', label:'微信支付', color:'#07C160' },
  ];
  return (
    <div style={overlay} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={modal}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, ...btn(), background:'transparent', color:C.muted, padding:'4px 8px', fontSize:18 }}>×</button>
        {step==='choose' && <>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>订阅 {plan.name}</div>
            <div style={{ fontSize:24, fontWeight:700, color:plan.color }}>¥{plan.price}<span style={{ fontSize:14, color:C.muted }}>{plan.unit}</span></div>
          </div>
          <div style={{ fontSize:12, color:C.dim, marginBottom:10 }}>选择支付方式</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
            {METHODS.map(m=>(
              <div key={m.id} onClick={()=>setMethod(m.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, border:`1.5px solid ${method===m.id?m.color:C.border}`, cursor:'pointer', background:method===m.id?m.color+'18':'transparent', transition:'all 0.15s' }}>
                <span style={{ fontWeight:600, fontSize:14, color:method===m.id?m.color:C.text }}>{m.label}</span>
                {method===m.id && <span style={{ marginLeft:'auto', fontSize:16, color:m.color }}>✓</span>}
              </div>
            ))}
          </div>
          <button onClick={goQR} style={{ ...btn(), width:'100%', padding:'13px', background:`linear-gradient(135deg,${C.accent},#4f46e5)`, color:'#fff', fontSize:15 }}>确认支付 ¥{plan.price}</button>
        </>}
        {step==='requesting' && <div style={{ textAlign:'center', padding:'32px 0' }}><div style={{ fontSize:28, marginBottom:12 }}>⏳</div><div style={{ fontSize:14, fontWeight:600 }}>正在创建订单...</div></div>}
        {step==='qr' && <>
          <div style={{ textAlign:'center', marginBottom:14 }}><div style={{ fontSize:15, fontWeight:700 }}>{method==='alipay'?'支付宝':'微信'}扫码支付</div><div style={{ fontSize:13, color:C.muted }}>¥{plan.price}{plan.unit}</div></div>
          <div style={{ background:'#fff', borderRadius:14, padding:16, margin:'0 auto 12px', width:180, height:180, display:'flex', alignItems:'center', justifyContent:'center' }}><QRPattern method={method}/></div>
          <div style={{ textAlign:'center', fontSize:12, color:C.dim, marginBottom:10 }}>有效期 {fmt(countdown)}</div>
          <button onClick={simPay} style={{ ...btn(), width:'100%', padding:11, background:method==='alipay'?'#1677FF':'#07C160', color:'#fff', fontSize:14 }}>模拟支付成功 →</button>
        </>}
        {step==='polling' && <div style={{ textAlign:'center', padding:'32px 0' }}><div style={{ fontSize:28, marginBottom:12 }}>🔄</div><div style={{ fontSize:14, fontWeight:600 }}>确认支付结果...</div></div>}
        {step==='success' && <div style={{ textAlign:'center', padding:'20px 0' }}><div style={{ fontSize:52, marginBottom:12 }}>🎉</div><div style={{ fontSize:16, fontWeight:700, color:C.success }}>支付成功！</div><div style={{ fontSize:13, color:C.muted }}>已订阅 {plan.name}</div></div>}
      </div>
    </div>
  );
}

function MemberPage({ currentPlan, onSelectPlan }) {
  return (
    <div style={{ padding:32, maxWidth:900 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>会员套餐</h1>
        <p style={{ margin:'6px 0 0', color:C.muted, fontSize:14 }}>升级会员，解锁更多声音克隆与生成能力</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {PLANS.map(plan=>{
          const isActive=currentPlan===plan.id; const isFeatured=plan.id==='pro';
          return (
            <div key={plan.id} style={{ background:C.card, borderRadius:16, border:`${isFeatured?'2px':'1px'} solid ${isFeatured?plan.color:C.border}`, padding:24, display:'flex', flexDirection:'column', position:'relative' }}>
              {plan.badge && <div style={{ position:'absolute', top:14, right:14, background:plan.color, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6 }}>{plan.badge}</div>}
              <div style={{ fontSize:22, marginBottom:10 }}>{plan.id==='free'?'🎵':plan.id==='pro'?'⚡':'👑'}</div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{plan.name}</div>
              <div style={{ marginBottom:16 }}>{plan.price===0?<span style={{ fontSize:22, fontWeight:700, color:C.muted }}>免费</span>:<><span style={{ fontSize:28, fontWeight:700, color:plan.color }}>¥{plan.price}</span><span style={{ fontSize:13, color:C.dim }}>{plan.unit}</span></>}</div>
              <div style={{ flex:1, marginBottom:18 }}>{plan.features.map(f=><div key={f} style={{ display:'flex', gap:7, marginBottom:7, fontSize:12.5, color:C.muted }}><span style={{ color:plan.color }}>✓</span>{f}</div>)}</div>
              {isActive?<div style={{ textAlign:'center', padding:10, borderRadius:10, background:plan.color+'18', color:plan.color, fontSize:13, fontWeight:600 }}>当前套餐</div>
              :plan.price===0?<button onClick={()=>onSelectPlan(plan)} style={{ ...btn(), padding:10, background:'transparent', color:C.muted, border:`1px solid ${C.border}`, fontSize:13 }}>降级</button>
              :<button onClick={()=>onSelectPlan(plan)} style={{ ...btn(), padding:10, background:isFeatured?`linear-gradient(135deg,${C.accent},#4f46e5)`:`${plan.color}22`, color:isFeatured?'#fff':plan.color, border:`1px solid ${isFeatured?'transparent':plan.color+'44'}`, fontSize:13 }}>立即订阅</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────── 主应用 ─────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('clone');
  const [voices, setVoices] = useState(DEMO_VOICES);
  const [selVoice, setSelVoice] = useState(null);
  const [recState, setRecState] = useState('idle');
  const [recTime, setRecTime] = useState(0);
  const [recUrl, setRecUrl] = useState(null);
  const [clonePct, setClonePct] = useState(0);
  const [cloneName, setCloneName] = useState('');
  const [upFile, setUpFile] = useState(null);
  const [upState, setUpState] = useState('idle');
  const [upClonePct, setUpClonePct] = useState(0);
  const [genText, setGenText] = useState('');
  const [genState, setGenState] = useState('idle');
  const [genPct, setGenPct] = useState(0);
  const [payTarget, setPayTarget] = useState(null);

  const mrRef=useRef(null); const chunksRef=useRef([]); const timerRef=useRef(null);
  const streamRef=useRef(null); const analyserRef=useRef(null); const canvasRef=useRef(null);
  const animRef=useRef(null); const audioCtxRef=useRef(null); const fileRef=useRef(null);

  const drawWave = useCallback(()=>{
    const canvas=canvasRef.current; const analyser=analyserRef.current; if(!canvas||!analyser) return;
    const ctx=canvas.getContext('2d'); const buf=new Uint8Array(analyser.frequencyBinCount);
    const draw=()=>{ animRef.current=requestAnimationFrame(draw); analyser.getByteTimeDomainData(buf); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.strokeStyle=C.accentL; ctx.lineWidth=2; ctx.beginPath(); const sw=canvas.width/buf.length; buf.forEach((v,i)=>{ const y=(v/128)*canvas.height/2; i===0?ctx.moveTo(0,y):ctx.lineTo(i*sw,y); }); ctx.lineTo(canvas.width,canvas.height/2); ctx.stroke(); }; draw();
  },[]);

  const stopWave = () => animRef.current && cancelAnimationFrame(animRef.current);
  const startRec = async () => {
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true}); streamRef.current=stream;
      const ac=new AudioContext(); audioCtxRef.current=ac;
      const src=ac.createMediaStreamSource(stream); const an=ac.createAnalyser(); an.fftSize=512;
      src.connect(an); analyserRef.current=an; chunksRef.current=[];
      const mr=new MediaRecorder(stream); mrRef.current=mr;
      mr.ondataavailable=e=>chunksRef.current.push(e.data);
      mr.onstop=()=>{ const blob=new Blob(chunksRef.current,{type:'audio/webm'}); setRecUrl(URL.createObjectURL(blob)); setRecState('preview'); stopWave(); stream.getTracks().forEach(t=>t.stop()); };
      mr.start(); setRecState('recording'); setRecTime(0);
      timerRef.current=setInterval(()=>setRecTime(t=>t+1),1000); drawWave();
    } catch { alert('无法访问麦克风'); }
  };
  const stopRec = () => { clearInterval(timerRef.current); mrRef.current?.stop(); };
  const simProgress = (set, onDone) => { set(0); let p=0; const iv=setInterval(()=>{ p+=Math.random()*7+3; if(p>=100){p=100;clearInterval(iv);setTimeout(onDone,300);} set(Math.min(p,100)); },160); };
  const cloneRec = () => { setRecState('cloning'); simProgress(setClonePct,()=>{ const name=cloneName.trim()||`我的声音 #${voices.length+1}`; const colors=[C.warn,C.accentL,C.success,'#f472b6','#38bdf8']; setVoices(v=>[...v,{id:Date.now(),name,dur:fmt(recTime),date:new Date().toLocaleDateString('zh',{month:'2-digit',day:'2-digit'}),emoji:['🎤','🎵','🌊','✨','🔥'][voices.length%5],color:colors[voices.length%5]}]); setRecState('done'); }); };
  const cloneUp = () => { setUpState('cloning'); simProgress(setUpClonePct,()=>{ const name=upFile.name.replace(/\.[^.]+$/,'')||`上传声音 #${voices.length+1}`; setVoices(v=>[...v,{id:Date.now(),name,dur:'--:--',date:new Date().toLocaleDateString('zh',{month:'2-digit',day:'2-digit'}),emoji:'📁',color:C.muted}]); setUpState('done'); }); };
  const generate = () => { if(!genText.trim()||!selVoice) return; setGenState('generating'); simProgress(setGenPct,()=>setGenState('done')); };
  const resetRec = () => { setRecState('idle'); setRecUrl(null); setRecTime(0); setClonePct(0); setCloneName(''); };

  if (!user) return <AuthPage onLogin={u=>{setUser(u);}} />;

  const currentPlan = user.plan || 'free';
  const setPlan = p => { const u=USER_DB.find(u=>u.email===user.email); if(u) u.plan=p; setUser(prev=>({...prev,plan:p})); };
  const planBadge = PLANS.find(p=>p.id===currentPlan);

  return (
    <div style={{ display:'flex', height:'100vh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif', overflow:'hidden' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} .vcard:hover{background:rgba(124,58,237,0.1)!important} input:focus,textarea:focus{outline:none;border-color:${C.accent}!important} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}`}</style>

      {payTarget && <PaymentModal plan={payTarget} onClose={()=>setPayTarget(null)} onSuccess={p=>{setPlan(p.id);setPayTarget(null);}}/>}

      {/* Sidebar */}
      <div style={{ width:256, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'20px 16px 16px', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${C.accent},#4f46e5)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎙</div>
            <div><div style={{ fontWeight:700, fontSize:14 }}>VoiceClone AI</div><div style={{ fontSize:11, color:C.dim }}>声音克隆平台</div></div>
          </div>
        </div>

        <div style={{ padding:'12px 8px', borderBottom:`1px solid ${C.border}` }}>
          {[['clone','🎤','克隆声音'],['generate','✨','生成语音'],['member','👑','会员套餐'],['profile','👤','个人资料']].map(([id,ic,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ ...btn(), width:'100%', textAlign:'left', padding:'9px 12px', background:tab===id?C.accentDim:'transparent', color:tab===id?C.accentL:C.muted, marginBottom:2, display:'flex', alignItems:'center', gap:8, fontWeight:tab===id?600:400 }}>
              <span style={{ fontSize:14 }}>{ic}</span>{lbl}
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflow:'auto', padding:'12px 8px' }}>
          <div style={{ fontSize:10, fontWeight:600, color:C.dim, letterSpacing:'0.1em', padding:'0 8px', marginBottom:10 }}>声音库 · {voices.length}</div>
          {voices.map(v=>(
            <div key={v.id} className="vcard" onClick={()=>setSelVoice(v.id)} style={{ padding:'9px 12px', borderRadius:8, marginBottom:4, cursor:'pointer', background:selVoice===v.id?C.accentDim:'transparent', border:`1px solid ${selVoice===v.id?C.accent+'55':'transparent'}`, transition:'all 0.15s', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:v.color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{v.emoji}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.name}</div>
                <div style={{ fontSize:11, color:C.dim }}>{v.dur} · {v.date}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding:'12px', borderTop:`1px solid ${C.border}` }}>
          <UserMenu user={user} onLogout={()=>setUser(null)} onProfile={()=>setTab('profile')}/>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', marginTop:6, borderRadius:8, background:planBadge.color+'18', cursor:'pointer' }} onClick={()=>setTab('member')}>
            <span>{currentPlan==='free'?'🎵':currentPlan==='pro'?'⚡':'👑'}</span>
            <span style={{ fontSize:12, fontWeight:600, color:planBadge.color }}>{planBadge.name}</span>
            {currentPlan==='free' && <span style={{ marginLeft:'auto', fontSize:11, color:C.accent }}>升级 →</span>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:'auto' }}>
        {tab==='clone' && (
          <div style={{ padding:32, maxWidth:860 }}>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>克隆你的声音</h1>
              <p style={{ margin:'6px 0 0', color:C.muted, fontSize:14 }}>录制或上传 30 秒以上清晰音频，AI 将为你复刻专属声音模型</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <Card>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:recState==='recording'?C.danger:C.accent, display:'inline-block', animation:recState==='recording'?'pulse 1s infinite':'none' }}/>
                  <span style={{ fontSize:13, fontWeight:600, color:C.muted }}>麦克风录音</span>
                </div>
                <WaveBox recState={recState} recUrl={recUrl} clonePct={clonePct} canvasRef={canvasRef}/>
                <div style={{ marginTop:14 }}>
                  {recState==='idle' && <BigBtn onClick={startRec}>🎤 开始录音</BigBtn>}
                  {recState==='recording' && <><div style={{ textAlign:'center', color:C.danger, fontSize:13, marginBottom:8, fontWeight:600 }}>⏺ 录音中 {fmt(recTime)}</div><BigBtn onClick={stopRec} bg={C.danger}>⏹ 停止录音</BigBtn></>}
                  {recState==='preview' && <>
                    <input value={cloneName} onChange={e=>setCloneName(e.target.value)} placeholder="为这个声音命名（可选）" style={{ width:'100%', padding:'9px 12px', borderRadius:8, background:'#0a0a16', border:`1px solid ${C.border}`, color:C.text, fontSize:13, marginBottom:10, boxSizing:'border-box' }}/>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={resetRec} style={{ ...btn(), flex:1, padding:10, background:'transparent', color:C.muted, border:`1px solid ${C.border}` }}>重录</button>
                      <button onClick={cloneRec} style={{ ...btn(), flex:2, padding:10, background:`linear-gradient(135deg,${C.accent},#4f46e5)`, color:'#fff' }}>✨ 开始克隆</button>
                    </div>
                  </>}
                  {recState==='done' && <BigBtn onClick={resetRec} bg={C.success+'22'} col={C.success}>✅ 克隆成功！继续录制</BigBtn>}
                </div>
              </Card>
              <Card>
                <div style={{ fontSize:13, fontWeight:600, color:C.muted, marginBottom:16 }}>📁 上传音频文件</div>
                <UploadBox upFile={upFile} setUpFile={setUpFile} upState={upState} setUpState={setUpState} upClonePct={upClonePct} fileRef={fileRef}/>
                {upState==='idle' && upFile && <BigBtn onClick={cloneUp}>✨ 开始克隆</BigBtn>}
                {upState==='done' && <BigBtn onClick={()=>{setUpFile(null);setUpState('idle');setUpClonePct(0);}} bg={C.success+'22'} col={C.success}>✅ 克隆成功！上传更多</BigBtn>}
                {!upFile && upState==='idle' && <div style={{ textAlign:'center', color:C.dim, fontSize:12, padding:'4px 0' }}>支持 MP3、WAV、M4A、FLAC 格式</div>}
              </Card>
            </div>
            <Card>
              <div style={{ fontSize:11, fontWeight:600, color:C.dim, marginBottom:8 }}>💡 录音技巧</div>
              <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
                {['安静环境效果更佳','建议录制 30 秒以上','正常语速，避免过多停顿','麦克风距嘴 20–30cm'].map(t=><span key={t} style={{ fontSize:12, color:C.muted }}>✓ {t}</span>)}
              </div>
            </Card>
          </div>
        )}
        {tab==='generate' && (
          <div style={{ padding:32, maxWidth:720 }}>
            <div style={{ marginBottom:24 }}><h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>生成语音</h1><p style={{ margin:'6px 0 0', color:C.muted, fontSize:14 }}>选择克隆声音，输入文字，一键生成专属音频</p></div>
            <Card style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.muted, marginBottom:12 }}>选择声音</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {voices.map(v=>(
                  <button key={v.id} onClick={()=>setSelVoice(v.id)} style={{ ...btn(), padding:'8px 14px', background:selVoice===v.id?C.accentDim:'transparent', color:selVoice===v.id?C.accentL:C.muted, border:`1px solid ${selVoice===v.id?C.accent+'88':C.border}`, display:'flex', alignItems:'center', gap:6, fontWeight:selVoice===v.id?600:400 }}>
                    <span>{v.emoji}</span>{v.name}
                  </button>
                ))}
              </div>
            </Card>
            <Card style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.muted, marginBottom:12 }}>输入文字 <span style={{ fontWeight:400, color:C.dim }}>({genText.length}/500)</span></div>
              <textarea value={genText} onChange={e=>setGenText(e.target.value.slice(0,500))} placeholder="输入想要转换成语音的文字内容..." rows={5} style={{ width:'100%', padding:12, borderRadius:8, background:'#0a0a16', border:`1px solid ${C.border}`, color:C.text, fontSize:14, resize:'vertical', boxSizing:'border-box', lineHeight:1.7, fontFamily:'inherit' }}/>
            </Card>
            {genState==='idle' && <button onClick={generate} disabled={!genText.trim()||!selVoice} style={{ ...btn(), padding:'13px 28px', background:genText.trim()&&selVoice?`linear-gradient(135deg,${C.accent},#4f46e5)`:C.border, color:genText.trim()&&selVoice?'#fff':C.dim, cursor:genText.trim()&&selVoice?'pointer':'not-allowed', fontSize:15 }}>✨ 生成语音</button>}
            {genState==='generating' && <Card><div style={{ fontSize:13, color:C.muted, marginBottom:10 }}>⚡ 正在合成语音...</div><ProgressBar pct={genPct}/></Card>}
            {genState==='done' && <Card style={{ border:`1px solid ${C.success}44` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}><span style={{ color:C.success, fontSize:13, fontWeight:600 }}>✅ 生成成功</span><span style={{ background:C.accentDim, color:C.accentL, fontSize:11, padding:'2px 8px', borderRadius:6 }}>Demo</span></div>
              <div style={{ background:'#0a0a16', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
                <button style={{ ...btn(), width:36, height:36, borderRadius:'50%', background:C.accent, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>▶</button>
                <div style={{ flex:1, background:C.border, borderRadius:100, height:4 }}/>
                <span style={{ fontSize:12, color:C.dim }}>0:00</span>
                <button style={{ ...btn(), padding:'6px 12px', background:C.accentDim, color:C.accentL, border:`1px solid ${C.accent}44`, fontSize:12 }}>⬇ 下载</button>
              </div>
              <button onClick={()=>{setGenState('idle');setGenPct(0);}} style={{ ...btn(), marginTop:12, padding:'7px 14px', background:'transparent', color:C.dim, border:`1px solid ${C.border}`, fontSize:12 }}>重新生成</button>
            </Card>}
          </div>
        )}
        {tab==='member' && <MemberPage currentPlan={currentPlan} onSelectPlan={plan=>{ if(plan.price>0) setPayTarget(plan); else setPlan('free'); }}/>}
        {tab==='profile' && <ProfilePage user={user} setUser={u=>{setUser(u); const db=USER_DB.find(x=>x.email===u.email); if(db){db.name=u.name;db.avatar=u.avatar;}}}/>}
      </div>
    </div>
  );
}
