const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const memory=new Map(),listeners={};let behavior='login',resolveProfile,calls=[];
const customer={email:'test@example.invalid',name:'Test',lastContact:{phone:'private-contact'},lastHomeAddress:{receiverAddress:'private-address'}};
const response=(status,data)=>({ok:status<400,status,json:async()=>data});
const window={dispatchEvent(){},addEventListener(type,fn){listeners[type]=fn}};
const context={window,document:{currentScript:{getAttribute:()=>'/js/account-auth.js'},getElementsByTagName:()=>[]},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},CustomEvent:class{constructor(type,data){this.type=type;this.detail=data?.detail}},AbortController,setTimeout,clearTimeout,console,fetch:async(url,options={})=>{calls.push({url,options});if(url.includes('action=config'))return response(200,{googleClientId:'public-client',logoutAll:true});if(url.includes('action=me')){if(behavior==='pending-profile')return new Promise(resolve=>resolveProfile=resolve);if(behavior==='profile-down')return response(503,{});return response(200,{customer})}if(behavior==='logout-down')return response(503,{});if(JSON.parse(options.body||'{}').action.startsWith('logout'))return response(200,{ok:true});return response(200,{token:'isolated-test-token',customer})}};
vm.runInNewContext(fs.readFileSync('js/account-auth.js','utf8'),context);
(async()=>{
const api=window.RisuanAccount;await api.loginWithGoogleCredential('test-only');assert(!memory.get('risuan-account').includes('private-contact'));assert(!memory.get('risuan-account').includes('private-address'));assert.equal(api.getCustomer().lastContact.phone,'private-contact');
behavior='logout-down';await assert.rejects(api.logout());assert.equal(api.getToken(),'isolated-test-token');
behavior='profile-down';await api.syncProfile();assert.equal(api.getToken(),'isolated-test-token');
behavior='pending-profile';const profile=api.syncProfile();behavior='login';await api.logout();assert.equal(api.getToken(),null);resolveProfile(response(200,{customer}));await profile;assert.equal(api.getToken(),null,'Late profile response must not resurrect logged-out identity');
await api.loginWithGoogleCredential('test-only');await api.logout({all:true});assert.equal(JSON.parse(calls.at(-1).options.body).action,'logout-all');assert.equal(api.getToken(),null);
await api.loginWithGoogleCredential('test-only');memory.set('risuan-account',JSON.stringify({token:'other-tab-token',customer:{email:'other@example.invalid'}}));listeners.storage({key:'risuan-account'});assert.equal(api.getCustomer().email,'other@example.invalid');assert(!api.getCustomer().lastContact);
assert.equal((await api.getAuthConfig()).logoutAll,true);assert.equal(await api.getGoogleClientId(),'public-client');
console.log('PASS member session client: safe persistence, logout server failure, 503 preservation, late-profile race, all-device action, cross-tab identity sync and config compatibility. No live network.');
})().catch(e=>{console.error(e);process.exitCode=1});
