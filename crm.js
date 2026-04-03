
const BOOKINGS_KEY='tumatour_bookings_v1';
const TESTIMONIALS_KEY='tumatour_public_testimonials_v1';
const SESSION_KEY='tumatour_crm_session_v1';
function getItems(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return[]}}
function setItems(key,items){localStorage.setItem(key,JSON.stringify(items))}
const loginWrap=document.getElementById('loginWrap');
const crmApp=document.getElementById('crmApp');
const loginForm=document.getElementById('loginForm');
const logoutBtn=document.getElementById('logoutBtn');
function openApp(){loginWrap?.classList.add('hidden');crmApp?.classList.remove('hidden');renderBookings();renderTestimonials()}
function closeApp(){crmApp?.classList.add('hidden');loginWrap?.classList.remove('hidden')}
if(localStorage.getItem(SESSION_KEY)==='ok'){openApp()}
loginForm?.addEventListener('submit',(e)=>{e.preventDefault();const u=document.getElementById('crmUser')?.value?.trim();const p=document.getElementById('crmPass')?.value?.trim();if(u==='admin'&&p==='admin123'){localStorage.setItem(SESSION_KEY,'ok');openApp()}else{alert('Credenciales incorrectas')}})
logoutBtn?.addEventListener('click',()=>{localStorage.removeItem(SESSION_KEY);closeApp()})
function renderBookings(){
 const wrap=document.getElementById('bookingsList'); if(!wrap)return;
 const items=getItems(BOOKINGS_KEY).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
 if(!items.length){wrap.innerHTML='<div class="empty-box">No hay reservas registradas todavía.</div>';return;}
 wrap.innerHTML=items.map(item=>`<article class="admin-item"><div class="admin-item-top"><div><strong>${item.name||''}</strong><br><span class="muted">${item.phone||''}</span></div><span class="tag">${item.tour||''}</span></div><p>Fecha: ${item.date||''}</p></article>`).join('');
}
function renderTestimonials(){
 const wrap=document.getElementById('crmTestimonialsList'); if(!wrap)return;
 const items=getItems(TESTIMONIALS_KEY).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0));
 if(!items.length){wrap.innerHTML='<div class="empty-box">No hay comentarios publicados todavía.</div>';return;}
 wrap.innerHTML=items.map(item=>`<article class="admin-item"><div class="admin-item-top"><div><strong>${item.name||'Visitante'}</strong><br><span class="muted">${item.city||''}</span></div><button class="btn btn-danger" data-del="${item.id}">Borrar</button></div><p>${item.message||''}</p></article>`).join('');
 wrap.querySelectorAll('[data-del]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.getAttribute('data-del'); if(!confirm('¿Seguro que deseas borrar este comentario?'))return; const items=getItems(TESTIMONIALS_KEY).filter(item=>item.id!==id); setItems(TESTIMONIALS_KEY,items); renderTestimonials();}));
}
