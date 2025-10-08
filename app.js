import * as Calc from './calc.js';
import * as FB from './firebase.js';

// Simple app state (avoids window.* pollution)
const AppState = {
  user: null,
  meta: null,
  calc: null,
  day: { meals: {} },
  lastLoadedDate: null
};

/* DOM refs */
const metaNome = document.getElementById('metaNome');
const metaAltura = document.getElementById('metaAltura');
const metaSexo = document.getElementById('metaSexo');
const metaAtividade = document.getElementById('metaAtividade');
const metaEsteira = document.getElementById('metaEsteira');
const metaIdade = document.getElementById('metaIdade');
const metaPeso = document.getElementById('metaPeso');
const metaMusculacao = document.getElementById('metaMusculacao');
const metaObjetivo = document.getElementById('metaObjetivo');
const metaCintura = document.getElementById('metaCintura');
const metaPescoco = document.getElementById('metaPescoco');
const metaQuadril = document.getElementById('metaQuadril');

const calcMetaBtn = document.getElementById('calcMeta');
const aplicarMetaBtn = document.getElementById('aplicarMeta');

const tmbBadge = document.getElementById('tmbBadge');
const esteiraBadge = document.getElementById('esteiraBadge');
const muscuBadge = document.getElementById('muscuBadge');
const tdeeBadge = document.getElementById('tdeeBadge');
const metaBadge = document.getElementById('metaBadge');
const bfBadge = document.getElementById('bfBadge');

const mainScreen = document.getElementById('mainScreen');
const userEmailEl = document.getElementById('userEmail');

async function loadMeta(){
  if(!AppState.user) return;
  try {
    const metaRef = FB.doc(FB.db, 'users', AppState.user.uid, 'meta', 'settings');
    const snap = await FB.getDoc(metaRef);
    if(snap.exists()){
      AppState.meta = snap.data();
      // populate UI
      metaNome.value = AppState.meta.nome || '';
      metaPeso.value = AppState.meta.peso || '';
      metaAltura.value = AppState.meta.altura || '';
      metaIdade.value = AppState.meta.idade || '';
      metaSexo.value = AppState.meta.sexo || 'M';
      metaAtividade.value = AppState.meta.nivel || 1.2;
      metaEsteira.value = AppState.meta.esteira || 0;
      metaMusculacao.value = AppState.meta.musculacao || 0;
      metaObjetivo.value = AppState.meta.objetivo || 0;
    } else {
      AppState.meta = {};
    }
  } catch(err){
    console.warn('loadMeta error', err);
  }
}

async function loadDay(dateStr){
  if(!AppState.user) return;
  if(!dateStr) dateStr = dateToYMD(new Date());
  const dRef = FB.doc(FB.db, 'users', AppState.user.uid, 'days', dateStr);
  const snap = await FB.getDoc(dRef);
  if(snap.exists()){
    AppState.day = snap.data();
  } else {
    // day missing → zero exercise and recalc TDEE/meta with zero training
    const peso = Number(AppState.meta?.peso) || Number(metaPeso.value) || 0;
    const altura = Number(AppState.meta?.altura) || Number(metaAltura.value) || 0;
    const idade = Number(AppState.meta?.idade) || Number(metaIdade.value) || 0;
    const sexo = AppState.meta?.sexo || metaSexo.value || 'M';
    const nivel = Number(AppState.meta?.nivel) || Number(metaAtividade.value) || 1.2;
    const tmb = Calc.calcTMB({peso, altura, idade, sexo});
    const esteiraKcal = 0;
    const muscuKcal = 0;
    const tdee = Calc.calcTDEE(tmb, nivel, esteiraKcal, muscuKcal);
    const objetivo = Number(AppState.meta?.objetivo ?? metaObjetivo.value) || 0;
    const meta = Calc.calcMeta(tdee, objetivo);

    AppState.day = { meals: {}, aguaConsumida:0, tmb, esteiraKcal, muscuKcal, tdee, meta };
  }

  // render
  renderDay();
  if(dateStr === dateToYMD(new Date())) AppState.lastLoadedDate = dateStr;
}

function renderDay(){
  // map data to badges (prefer day values, fallback to meta)
  const d = AppState.day || {};
  const dayTmb = Number(d.tmb) || Number(AppState.meta?.tmb) || 0;
  const dayEsteira = Number(d.esteiraKcal) || Number(AppState.meta?.esteira) || 0;
  const dayMuscu = Number(d.muscuKcal || d.musculacaoKcal) || Number(AppState.meta?.musculacao) || 0;
  const dayTdee = Number(d.tdee) || Number(AppState.meta?.tdee) || 0;
  const dayMeta = Number(d.meta) || Number(AppState.meta?.meta) || 0;

  tmbBadge.innerHTML = 'TMB<br><strong>' + dayTmb + ' kcal</strong>';
  esteiraBadge.innerHTML = 'Esteira<br><strong>' + dayEsteira + ' kcal</strong>';
  muscuBadge.innerHTML = 'Musculação<br><strong>' + dayMuscu + ' kcal</strong>';
  tdeeBadge.innerHTML = 'TDEE<br><strong>' + dayTdee + ' kcal</strong>';
  metaBadge.innerHTML = 'Meta<br><strong>' + dayMeta + ' kcal</strong>';
  // BF badge if available in meta
  bfBadge.innerHTML = 'BF<br><strong>' + (AppState.meta?.bf ?? '-') + ' %</strong>';
}

function dateToYMD(d=new Date()){
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

/* Buttons */
calcMetaBtn?.addEventListener('click', ()=>{
  const peso = Number(metaPeso.value) || 0;
  const altura = Number(metaAltura.value) || 0;
  const idade = Number(metaIdade.value) || 0;
  const sexo = metaSexo.value || 'M';
  const nivel = Number(metaAtividade.value) || 1.2;
  const esteiraKm = Number(metaEsteira.value) || 0;
  const muscH = Number(metaMusculacao.value) || 0;
  const tmb = Calc.calcTMB({peso, altura, idade, sexo});
  const esteiraKcal = Calc.calcEsteiraKcal(peso, esteiraKm);
  const muscuKcal = Calc.calcMusculacaoKcal(peso, muscH);
  const tdee = Calc.calcTDEE(tmb, nivel, esteiraKcal, muscuKcal);
  const objetivo = Number(metaObjetivo.value) || 0;
  const meta = Calc.calcMeta(tdee, objetivo);

  // update UI badges
  tmbBadge.innerHTML = 'TMB<br><strong>'+tmb+' kcal</strong>';
  esteiraBadge.innerHTML = 'Esteira<br><strong>'+esteiraKcal+' kcal</strong>';
  muscuBadge.innerHTML = 'Musculação<br><strong>'+muscuKcal+' kcal</strong>';
  tdeeBadge.innerHTML = 'TDEE<br><strong>'+tdee+' kcal</strong>';
  metaBadge.innerHTML = 'Meta<br><strong>'+meta+' kcal</strong>';

  // store in AppState.calc but DO NOT overwrite meta doc until user applies
  AppState.calc = { tmb, esteiraKcal, muscuKcal, tdee, meta, objetivo };
});

/* Aplicar meta: grava no metaDoc (merge) incluindo bf se calculado */
aplicarMetaBtn?.addEventListener('click', async ()=>{
  if(!AppState.user) { alert('Usuário não autenticado'); return; }
  const payload = {
    nome: metaNome.value || '',
    idade: parseInt(metaIdade.value) || AppState.meta?.idade || 0,
    peso: parseFloat(metaPeso.value) || AppState.meta?.peso || 0,
    altura: parseFloat(metaAltura.value) || AppState.meta?.altura || 0,
    nivel: parseFloat(metaAtividade.value) || AppState.meta?.nivel || 1.2,
    esteira: parseFloat(metaEsteira.value) || AppState.meta?.esteira || 0,
    musculacao: parseFloat(metaMusculacao.value) || AppState.meta?.musculacao || 0,
    objetivo: parseInt(metaObjetivo.value) || AppState.meta?.objetivo || 0,
    cintura: parseFloat(metaCintura.value) || AppState.meta?.cintura || 0,
    pescoco: parseFloat(metaPescoco.value) || AppState.meta?.pescoco || 0,
    quadril: parseFloat(metaQuadril.value) || AppState.meta?.quadril || 0,
    updatedAt: new Date().toISOString()
  };
  // persist
  try {
    const ref = FB.doc(FB.db, 'users', AppState.user.uid, 'meta', 'settings');
    await FB.setDoc(ref, payload, { merge: true });
    // update local state and UI
    Object.assign(AppState.meta || {}, payload);
    await loadMeta();
    alert('Meta aplicada com sucesso.');
  } catch(err){
    console.error('aplicarMeta error', err);
    alert('Erro ao aplicar meta: ' + err.message);
  }
});

/* Auth watch */
FB.onAuthStateChanged(FB.auth, async (u)=>{
  AppState.user = u;
  if(u){
    userEmailEl.textContent = u.email || u.uid;
    mainScreen.style.display = '';
    await loadMeta();
    await loadDay(dateToYMD(new Date()));
    // start auto-reset to midnight
    scheduleMidnightReload();
  } else {
    userEmailEl.textContent = '';
    mainScreen.style.display = 'none';
  }
});

/* Auto-reset exactly at next midnight (more efficient than setInterval) */
function scheduleMidnightReload(){
  const now = new Date();
  const nextMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
  const ms = nextMid.getTime() - now.getTime();
  setTimeout(()=>{
    loadDay(dateToYMD(new Date()));
    // reschedule for following midnight
    scheduleMidnightReload();
  }, ms + 2000); // small buffer
}

/* expose for debugging */
window.AppState = AppState;
window._ab = { loadDay, loadMeta };
