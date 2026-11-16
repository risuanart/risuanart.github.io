const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/line-login.js'),'utf8');
async function callback({request,query,customer,failStorage=false}){
 const status={textContent:''},back={hidden:true},calls=[];let cleared=false,redirect='';
 const context={window:{RisuanAccount:{getCustomer:()=>customer,loginWithLineCode:async payload=>calls.push(payload)}},document:{getElementById:id=>id==='line-callback-status'?status:id==='line-callback-back'?back:null},URL,URLSearchParams,Date,location:{search:query,pathname:'/account/line-callback/',href:'https://risuanart.com/account/line-callback/',replace:url=>redirect=String(url)},history:{replaceState:()=>cleared=true},sessionStorage:{getItem:()=>{if(failStorage)throw new Error('storage blocked');return JSON.stringify(request)},removeItem:()=>{}}};
 vm.runInNewContext(source,context);await new Promise(resolve=>setImmediate(resolve));return{status:status.textContent,back:back.hidden,calls,cleared,redirect};
}
(async()=>{
 const request={state:'s',nonce:'n'.repeat(43),verifier:'v'.repeat(43),createdAt:Date.now(),link:false};
 for(const [req,query]of [[null,'?state=s&code=c'],[request,'?state=bad&code=c'],[{...request,createdAt:Date.now()-660000},'?state=s&code=c'],[request,'?state=s&error=access_denied'],[request,'?state=s']]){const result=await callback({request:req,query});assert.equal(result.calls.length,0);assert.equal(result.back,false);assert.equal(result.cleared,true)}
 let result=await callback({request,query:'?state=s&code=c'});assert.equal(result.calls.length,1);assert.equal(result.calls[0].code,'c');assert.equal(result.redirect,'https://risuanart.com/account/?lineConnected=1');assert(result.status.includes('登入成功'));
 result=await callback({request:{...request,link:true,email:'one@example.com'},query:'?state=s&code=c',customer:{email:'two@example.com'}});assert.equal(result.calls.length,0);assert(result.status.includes('已變更'));
 result=await callback({request,query:'?state=s&code=c',failStorage:true});assert.equal(result.calls.length,0);assert.equal(result.back,false);
 console.log('PASS: missing state, forged state, expiry, cancellation, missing code, safe fixed redirect, current-account change, storage failure. No network.');
})().catch(e=>{console.error(e);process.exitCode=1});
