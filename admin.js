// admin.js - uses Firebase v9 modular SDK (replace FIREBASE CONFIG before use)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdTokenResult } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// CONFIG: replace with your Firebase project config
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const elm = id => document.getElementById(id);
const show = id => elm(id).style.display = 'block';
const hide = id => elm(id).style.display = 'none';
const setAuthMessage = m => { const a = elm('auth-msg'); if(a) a.textContent = m; };

elm('btnSignIn').addEventListener('click', async ()=>{
  const email = elm('email').value.trim();
  const password = elm('password').value;
  try{ await signInWithEmailAndPassword(auth, email, password); } catch(err){ setAuthMessage('Sign in failed: '+err.message); }
});
elm('btnSignOut').addEventListener('click', ()=> signOut(auth).catch(e=>setAuthMessage(e.message)));

onAuthStateChanged(auth, async (user)=>{
  if(user){
    const idTokenRes = await getIdTokenResult(user, true);
    const claims = idTokenRes.claims || {};
    if(claims.admin){
      show('admin-ui');
      setAuthMessage('Signed in as '+user.email+' (admin)');
      await loadSiteContent();
      await loadLeads();
    } else {
      hide('admin-ui');
      setAuthMessage('Signed in but not an admin.');
    }
  } else {
    hide('admin-ui');
    setAuthMessage('Please sign in with an admin account.');
  }
});

async function loadSiteContent(){
  const docRef = doc(db, 'site', 'content');
  const snap = await getDoc(docRef);
  if(snap.exists()){
    const data = snap.data();
    elm('admin_heroTitle').value = data.heroTitle || '';
    elm('admin_heroSub').value = data.heroSub || '';
    elm('admin_aboutText').value = data.aboutText || '';
  }
  const pricesRef = doc(db, 'site', 'prices');
  const pSnap = await getDoc(pricesRef);
  const prices = pSnap.exists() ? pSnap.data() : { iron:25, plastic:10, tin:30, other:5, books:8 };
  elm('admin_iron_price').value = prices.iron || 0;
  elm('admin_plastic_price').value = prices.plastic || 0;
  elm('admin_tin_price').value = prices.tin || 0;
  elm('admin_other_price').value = prices.other || 0;
  elm('admin_books_price').value = prices.books || 0;
}

elm('btnSaveContent').addEventListener('click', async ()=>{
  const contentRef = doc(db,'site','content');
  const pricesRef = doc(db,'site','prices');
  const content = { heroTitle: elm('admin_heroTitle').value, heroSub: elm('admin_heroSub').value, aboutText: elm('admin_aboutText').value, updatedAt: new Date() };
  const prices = { iron: Number(elm('admin_iron_price').value)||0, plastic: Number(elm('admin_plastic_price').value)||0, tin: Number(elm('admin_tin_price').value)||0, other: Number(elm('admin_other_price').value)||0, books: Number(elm('admin_books_price').value)||0, updatedAt: new Date() };
  await setDoc(contentRef, content, { merge: true });
  await setDoc(pricesRef, prices, { merge: true });
  setAuthMessage('Content & prices saved.');
});

elm('btnUpload').addEventListener('click', async ()=>{
  const hero = elm('heroFile').files[0];
  const c1 = elm('ceo1File').files[0];
  const c2 = elm('ceo2File').files[0];
  const uploads = [];
  if(hero) uploads.push({k:'hero',f:hero});
  if(c1) uploads.push({k:'ceo1',f:c1});
  if(c2) uploads.push({k:'ceo2',f:c2});
  if(!uploads.length){ elm('uploadStatus').textContent='No files selected'; return; }
  elm('uploadStatus').textContent='Uploading...';
  for(const u of uploads){
    const path = `uploads/${Date.now()}_${u.k}_${u.f.name}`;
    const sref = storageRef(storage, path);
    await uploadBytes(sref, u.f);
    const url = await getDownloadURL(sref);
    const imagesRef = doc(db,'site','images');
    const snap = await getDoc(imagesRef);
    const images = snap.exists() ? snap.data() : {};
    images[u.k] = url;
    await setDoc(imagesRef, images, { merge: true });
  }
  elm('uploadStatus').textContent='Upload complete.';
});

async function loadLeads(){
  const snaps = await getDocs(query(collection(db,'leads'), orderBy('ts','desc')));
  const list = elm('leadsList'); list.innerHTML = ''; const rows = [];
  snaps.forEach(docSnap=>{ const d = docSnap.data(); const div = document.createElement('div'); div.style.borderBottom='1px solid rgba(255,255,255,0.06)'; div.style.padding='8px 0'; div.innerHTML = `<div><strong>${d.name||'—'}</strong> — ${d.phone||''} <small style="opacity:.8">${new Date(d.ts?.toDate?.()||d.ts||'').toLocaleString()}</small></div><div style="opacity:.9">${d.message||d.reason||d.category||''}</div>`; list.appendChild(div); rows.push(Object.assign({id:docSnap.id}, d)); });
  elm('btnDownloadLeads').onclick = ()=>{ if(!rows.length){ alert('No leads'); return; } const headers = Object.keys(rows[0]); const csv = [headers.join(',')].concat(rows.map(r=>headers.map(h=>JSON.stringify(r[h]||'')).join(','))).join('\n'); const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download='leads.csv'; a.click(); URL.revokeObjectURL(url); };
}

elm('btnRefreshLeads').addEventListener('click', loadLeads);
elm('btnReload').addEventListener('click', loadSiteContent);
