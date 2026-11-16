const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../js/email-login.js'),'utf8');
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(){
 let time=1000000,requestCalls=[],verifyCalls=[],nextError=null;
 const node=(extra={})=>({hidden:false,disabled:false,value:'',textContent:'',events:{},addEventListener(event,handler){this.events[event]=handler},focus(){this.focused=true},...extra});
 const email=node({value:'member@example.com'}),code=node(),send=node(),verify=node(),resend=node(),change=node(),status=node(),destination=node();
 const emailForm=node({querySelector:s=>s==='input'?email:send,reportValidity:()=>email.value.includes('@'),reset:()=>email.value=''});
 const codeForm=node({hidden:true,querySelector:s=>s==='input'?code:verify,reportValidity:()=>/^\d{6}$/.test(code.value),reset:()=>code.value=''});
 const nodes={'[data-email-form]':emailForm,'[data-code-form]':codeForm,'[data-email-status]':status,'[data-email-destination]':destination,'[data-email-resend]':resend,'[data-email-change]':change};const root=node({hidden:true,querySelector:s=>nodes[s]});
 const account={API_BASE:'https://test.invalid',requestEmailLoginCode:async payload=>{requestCalls.push(payload);if(nextError)throw nextError;return{challengeId:'c'.repeat(43),email:payload.email.toLowerCase(),retryAfter:60}},loginWithEmailCode:async payload=>{verifyCalls.push(payload);if(nextError)throw nextError;return{email:'member@example.com'}}};
 let interval;class Clock extends Date{static now(){return time}}
 vm.runInNewContext(source,{document:{querySelector:()=>root},window:{RisuanAccount:account,addEventListener(){}},crypto:crypto.webcrypto,btoa,Date:Clock,URLSearchParams,location:{search:'?emailTest=1'},fetch:async()=>({ok:true,json:async()=>({emailLoginEnabled:true})}),setInterval:fn=>{interval=fn;return 1},clearInterval(){}});
 return{root,email,code,send,verify,resend,change,status,destination,emailForm,codeForm,requestCalls,verifyCalls,account,advance(ms){time+=ms;interval?.()},error(e){nextError=e}};
}
const event={preventDefault(){}};
(async()=>{
 let f=fixture();await settle();assert.equal(f.root.hidden,false);await f.emailForm.events.submit(event);await settle();assert.equal(f.requestCalls.length,1);assert.equal(f.requestCalls[0].browserKey.length,43);assert.equal(f.emailForm.hidden,true);assert.equal(f.codeForm.hidden,false);assert(f.destination.textContent.includes('member@example.com'));assert(f.resend.disabled);await f.resend.events.click();assert.equal(f.requestCalls.length,1);
 f.advance(61000);assert.equal(f.resend.disabled,false);await f.resend.events.click();await settle();assert.equal(f.requestCalls.length,2);assert.equal(f.requestCalls[0].browserKey,f.requestCalls[1].browserKey);
 f.code.value='123456';await f.codeForm.events.submit(event);assert.equal(f.verifyCalls.length,1);assert.equal(f.verifyCalls[0].challengeId,'c'.repeat(43));assert.equal(f.code.value,'');assert.equal(f.codeForm.hidden,true);assert.equal(f.emailForm.hidden,false);
 f=fixture();await settle();await f.emailForm.events.submit(event);await settle();f.error(Object.assign(new Error('驗證碼已失效'),{retryAfter:0}));f.code.value='123456';await f.codeForm.events.submit(event);assert(f.status.textContent.includes('失效'));assert.equal(f.codeForm.hidden,false);assert.equal(f.code.value,'');f.change.events.click();assert.equal(f.emailForm.hidden,false);assert.equal(f.codeForm.hidden,true);
 f=fixture();await settle();f.error(Object.assign(new Error('操作太頻繁'),{retryAfter:120}));await f.emailForm.events.submit(event);await settle();assert.equal(f.codeForm.hidden,true);assert(f.status.textContent.includes('太頻繁'));assert(f.resend.disabled);
 f=fixture();await settle();let done;f.account.requestEmailLoginCode=()=>new Promise(resolve=>done=resolve);f.emailForm.events.submit(event);assert(f.send.disabled);f.emailForm.events.submit(event);done({challengeId:'c'.repeat(43),email:'member@example.com',retryAfter:60});await settle();assert.equal(f.send.disabled,false);
 console.log('PASS Email UI: consent-purpose flow, send, resend countdown, browser binding reuse, verification payload, code cleared, expired/rate errors, change email, busy protection. No network or storage of verification codes.');
})().catch(error=>{console.error(error);process.exitCode=1});
