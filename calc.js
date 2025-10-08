// calc.js - metabolic and BF calculations (pure functions)
export function calcTMB({peso, altura, idade, sexo}) {
  peso = Number(peso)||0; altura = Number(altura)||0; idade = Number(idade)||0;
  if(sexo === 'M') return Math.round((10*peso)+(6.25*altura)-(5*idade)+5);
  return Math.round((10*peso)+(6.25*altura)-(5*idade)-161);
}

export function calcEsteiraKcal(peso, km){
  peso = Number(peso)||0; km = Number(km)||0;
  return Math.round(peso * km);
}

export function calcMusculacaoKcal(peso, horas){
  peso = Number(peso)||0; horas = Number(horas)||0;
  return Math.round(4 * peso * horas);
}

export function calcTDEE(tmb, nivel, esteiraKcal=0, muscuKcal=0){
  return Math.round(tmb * (Number(nivel)||1.2) + (Number(esteiraKcal)||0) + (Number(muscuKcal)||0));
}

export function calcMeta(tdee, objetivo){
  objetivo = Number(objetivo)||0;
  return Math.round(tdee + objetivo);
}

// BF from circumference (same formula you used upstream). For safety, keep a fallback.
export function calcBF({cintura, pescoco, altura, quadril, sexo}){
  // Fallback naive approach if inputs missing
  cintura = Number(cintura)||0; pescoco = Number(pescoco)||0; altura = Number(altura)||0; quadril = Number(quadril)||0;
  sexo = (sexo||'M')[0];
  if(sexo === 'M') {
    if(!cintura || !pescoco || !altura) return null;
    const A = Math.log10(cintura - pescoco);
    const B = Math.log10(altura);
    const bodyDensity = 1.10938 - 0.0008267 * (cintura - pescoco) + 0.0000016 * Math.pow((cintura - pescoco),2) - 0.0002574 * (Number(idade)||30);
    // simplified estimate (better to port exact formula later)
    const bf = (495 / bodyDensity) - 450;
    return Number.isFinite(bf) ? Number(bf.toFixed(1)) : null;
  } else {
    if(!cintura || !pescoco || !quadril || !altura) return null;
    // rough estimate for women (placeholder)
    const bf = 0.0;
    return null;
  }
}
