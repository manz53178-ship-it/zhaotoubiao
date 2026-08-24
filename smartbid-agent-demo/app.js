const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const modal=$('#modal'),toast=$('#toast');
const cfg=window.SMARTBID_CONFIG||{};
const configured=cfg.supabaseUrl?.startsWith('https://')&&cfg.supabaseKey?.startsWith('sb_publishable_');
const db=configured&&window.supabase?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey):null;
let currentUser=null;
let demoMode=true;
function addLoginUI(){const wrap=document.createElement('div');wrap.className='login-modal';wrap.id='loginModal';wrap.innerHTML=`<div class="login-card"><div class="brand-mark">智</div><h2>登录智标协同</h2><p>无需密码，我们会发送一次性登录链接</p><input id="loginEmail" type="email" placeholder="输入邮箱"><button id="loginBtn" class="primary">发送免密登录邮件</button><button id="demoBtn" class="ghost" style="width:100%;margin-top:10px;padding:11px">暂不连接后台，进入演示模式</button><small id="loginError"></small></div>`;document.body.appendChild(wrap);$('#loginBtn').onclick=login;$('#demoBtn').onclick=()=>{demoMode=true;$('#loginModal').classList.add('hide');notify('已进入演示模式')};$('#loginEmail').onkeydown=e=>{if(e.key==='Enter')login()}}
async function login(){if(!db){$('#loginError').textContent='请先在 supabase-config.js 中填写连接信息';return}const email=$('#loginEmail').value.trim();if(!email){$('#loginError').textContent='请输入邮箱';return}const btn=$('#loginBtn');btn.disabled=true;btn.textContent='正在发送...';const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}});btn.disabled=false;btn.textContent='重新发送登录邮件';if(error){$('#loginError').textContent='发送失败：'+error.message;return}$('#loginError').textContent='邮件已发送，请打开邮箱并点击登录链接'}
async function boot(){/* 公开演示模式：不显示登录界面，不连接用户会话。 */}
$('#newProject').onclick=()=>modal.classList.add('show');
$('#closeModal').onclick=()=>modal.classList.remove('show');
modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show')};
function notify(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}
$('#demoImport').onclick=()=>{modal.classList.remove('show');notify('示例招标文件已导入，Agent 开始解析')};
$('#fileInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(demoMode){modal.classList.remove('show');notify(`演示导入成功：${file.name}`);$('#runBtn').click();return}if(!db||!currentUser){modal.classList.remove('show');$('#loginModal').classList.remove('hide');notify('请先登录');return}const safe=file.name.replace(/[^a-zA-Z0-9._\u4e00-\u9fa5-]/g,'_');const path=`${currentUser.id}/${Date.now()}-${safe}`;notify('正在上传招标文件...');const {data:project,error:pErr}=await db.from('projects').insert({name:file.name.replace(/\.[^.]+$/,''),status:'analyzing'}).select().single();if(pErr){notify('创建项目失败，请检查数据库权限');return}const {error:uErr}=await db.storage.from('tender-files').upload(path,file,{upsert:false});if(uErr){notify('文件上传失败：'+uErr.message);return}const {error:dErr}=await db.from('documents').insert({project_id:project.id,file_name:file.name,storage_path:path,file_type:file.type,parse_status:'uploaded'});if(dErr){notify('文件记录保存失败');return}modal.classList.remove('show');notify(`已上传 ${file.name}，项目已写入数据库`)};
$$('.tabs button').forEach(btn=>btn.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.remove('active'));$$('.tab-content').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('#'+btn.dataset.tab).classList.add('active')});
const stages=[['招标解析中',18,'正在提取资格条件与评分办法...'],['知识检索中',42,'正在检索企业资质与同类案例...'],['方案编制中',68,'正在生成技术方案第 6 章：数据治理...'],['报价测算中',84,'正在根据 BOQ 与毛利边界计算报价...'],['模拟评审中',96,'正在按评分办法执行交叉复核...'],['全部完成',100,'全部交付物已生成，可进入人工复核。']];
let timer;
$('#runBtn').onclick=()=>{clearInterval(timer);let i=0;notify('多 Agent 工作流已重新启动');const tick=()=>{const [name,p,action]=stages[i];$('#runLabel').textContent=name;$('#progressText').textContent=p+'%';$('#progressBar').style.width=p+'%';$('#agentAction').textContent=action;const d=document.createElement('div');d.innerHTML=`<time>${new Date().toLocaleTimeString('zh-CN',{hour12:false})}</time><p><b>${name.replace('中','')}</b> ${action}</p>`;$('#log').prepend(d);if(++i===stages.length)clearInterval(timer)};tick();timer=setInterval(tick,950)};
$('#askBtn').onclick=()=>{const input=$('#askInput'),q=input.value.trim();if(!q)return;const d=document.createElement('div');d.innerHTML=`<time>${new Date().toLocaleTimeString('zh-CN',{hour12:false})}</time><p><b>协调 Agent</b> 已收到“${q}”。建议重点复核国产化适配证明与价格策略。</p>`;$('#log').prepend(d);input.value='';notify('Agent 团队已回答')};
$('#askInput').onkeydown=e=>{if(e.key==='Enter')$('#askBtn').click()};
boot();
