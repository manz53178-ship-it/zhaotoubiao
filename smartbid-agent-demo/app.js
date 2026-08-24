const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const modal=$('#modal'),toast=$('#toast');
$('#newProject').onclick=()=>modal.classList.add('show');
$('#closeModal').onclick=()=>modal.classList.remove('show');
modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show')};
function notify(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}
$('#demoImport').onclick=()=>{modal.classList.remove('show');notify('示例招标文件已导入，Agent 开始解析')};
$('#fileInput').onchange=e=>{if(e.target.files[0]){modal.classList.remove('show');notify(`已导入 ${e.target.files[0].name}`)}};
$$('.tabs button').forEach(btn=>btn.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.remove('active'));$$('.tab-content').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('#'+btn.dataset.tab).classList.add('active')});
const stages=[['招标解析中',18,'正在提取资格条件与评分办法...'],['知识检索中',42,'正在检索企业资质与同类案例...'],['方案编制中',68,'正在生成技术方案第 6 章：数据治理...'],['报价测算中',84,'正在根据 BOQ 与毛利边界计算报价...'],['模拟评审中',96,'正在按评分办法执行交叉复核...'],['全部完成',100,'全部交付物已生成，可进入人工复核。']];
let timer;
$('#runBtn').onclick=()=>{clearInterval(timer);let i=0;notify('多 Agent 工作流已重新启动');const tick=()=>{const [name,p,action]=stages[i];$('#runLabel').textContent=name;$('#progressText').textContent=p+'%';$('#progressBar').style.width=p+'%';$('#agentAction').textContent=action;const d=document.createElement('div');d.innerHTML=`<time>${new Date().toLocaleTimeString('zh-CN',{hour12:false})}</time><p><b>${name.replace('中','')}</b> ${action}</p>`;$('#log').prepend(d);if(++i===stages.length)clearInterval(timer)};tick();timer=setInterval(tick,950)};
$('#askBtn').onclick=()=>{const input=$('#askInput'),q=input.value.trim();if(!q)return;const d=document.createElement('div');d.innerHTML=`<time>${new Date().toLocaleTimeString('zh-CN',{hour12:false})}</time><p><b>协调 Agent</b> 已收到“${q}”。建议重点复核国产化适配证明与价格策略。</p>`;$('#log').prepend(d);input.value='';notify('Agent 团队已回答')};
$('#askInput').onkeydown=e=>{if(e.key==='Enter')$('#askBtn').click()};
