/**
 * CAPITAL — Sistema de Análisis de Tesorería y Balance Financiero
 * Lógica del Cliente (Frontend Institucional)
 */

let state = {
  moneda: "€",
  meta_ahorro_porcentaje: 20,
  ingresos: [],
  gastos: []
};

let currentGastoFilter = "todos";
let debounceTimer = null;

// Elementos DOM
const dom = {
  monedaSelect: document.getElementById("monedaSelect"),
  btnExportar: document.getElementById("btnExportar"),
  btnImportarTrigger: document.getElementById("btnImportarTrigger"),
  fileImport: document.getElementById("fileImport"),
  btnReiniciar: document.getElementById("btnReiniciar"),
  saveStatus: document.getElementById("saveStatus"),
  
  // KPIs
  totalIngresoAnual: document.getElementById("totalIngresoAnual"),
  totalIngresoMensual: document.getElementById("totalIngresoMensual"),
  totalGastoAnual: document.getElementById("totalGastoAnual"),
  totalGastoMensual: document.getElementById("totalGastoMensual"),
  balanceCard: document.getElementById("balanceCard"),
  balanceNetoAnual: document.getElementById("balanceNetoAnual"),
  balanceNetoMensual: document.getElementById("balanceNetoMensual"),
  tasaAhorroPorcentaje: document.getElementById("tasaAhorroPorcentaje"),
  tasaAhorroDiagnostico: document.getElementById("tasaAhorroDiagnostico"),
  
  // Matriz de distribución
  barNecesidad: document.getElementById("barNecesidad"),
  barDeseo: document.getElementById("barDeseo"),
  barAhorro: document.getElementById("barAhorro"),
  pctNecesidad: document.getElementById("pctNecesidad"),
  pctDeseo: document.getElementById("pctDeseo"),
  pctAhorro: document.getElementById("pctAhorro"),
  structureAnalysis: document.getElementById("structureAnalysis"),
  
  // Listados (Ledgers)
  listaIngresos: document.getElementById("listaIngresos"),
  listaGastos: document.getElementById("listaGastos"),
  colTotalIngresos: document.getElementById("colTotalIngresos"),
  colTotalGastos: document.getElementById("colTotalGastos"),
  
  // Analítica
  desgloseCategorias: document.getElementById("desgloseCategorias"),
  proj3m: document.getElementById("proj3m"),
  proj6m: document.getElementById("proj6m"),
  proj1y: document.getElementById("proj1y"),
  proj3y: document.getElementById("proj3y"),
  sliderRecorte: document.getElementById("sliderRecorte"),
  labelRecorte: document.getElementById("labelRecorte"),
  simResult: document.getElementById("simResult"),
  
  // Modales
  modalIngreso: document.getElementById("modalIngreso"),
  modalGasto: document.getElementById("modalGasto"),
  btnNuevoIngreso: document.getElementById("btnNuevoIngreso"),
  btnNuevoGasto: document.getElementById("btnNuevoGasto"),
  
  // Form Ingreso
  formIngreso: document.getElementById("formIngreso"),
  modalIngresoTitle: document.getElementById("modalIngresoTitle"),
  ingresoId: document.getElementById("ingresoId"),
  ingresoConcepto: document.getElementById("ingresoConcepto"),
  ingresoCategoria: document.getElementById("ingresoCategoria"),
  ingresoMonto: document.getElementById("ingresoMonto"),
  ingresoFrecuenciaPreset: document.getElementById("ingresoFrecuenciaPreset"),
  ingresoFrecuencia: document.getElementById("ingresoFrecuencia"),
  groupIngresoCustomFreq: document.getElementById("groupIngresoCustomFreq"),
  ingresoDescripcion: document.getElementById("ingresoDescripcion"),
  previewIngresoAnual: document.getElementById("previewIngresoAnual"),
  previewIngresoMensual: document.getElementById("previewIngresoMensual"),
  
  // Form Gasto
  formGasto: document.getElementById("formGasto"),
  modalGastoTitle: document.getElementById("modalGastoTitle"),
  gastoId: document.getElementById("gastoId"),
  gastoConcepto: document.getElementById("gastoConcepto"),
  gastoCategoria: document.getElementById("gastoCategoria"),
  gastoTipo: document.getElementById("gastoTipo"),
  gastoMonto: document.getElementById("gastoMonto"),
  gastoFrecuenciaPreset: document.getElementById("gastoFrecuenciaPreset"),
  gastoFrecuencia: document.getElementById("gastoFrecuencia"),
  groupGastoCustomFreq: document.getElementById("groupGastoCustomFreq"),
  gastoDescripcion: document.getElementById("gastoDescripcion"),
  previewGastoAnual: document.getElementById("previewGastoAnual"),
  previewGastoMensual: document.getElementById("previewGastoMensual")
};

// ==========================================
// FORMATEO FINANCIERO
// ==========================================
function fmtDinero(valor) {
  const v = Number(valor) || 0;
  return v.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " " + state.moneda;
}

function labelFrecuencia(frecuencia) {
  const f = Number(frecuencia);
  if (f === 12) return "12 cobros/año (Mensual)";
  if (f === 14) return "14 pagas/año (Con extras)";
  if (f === 1) return "1 cargo anual";
  if (f === 2) return "Semestral (2/año)";
  if (f === 4) return "Trimestral (4/año)";
  if (f === 26) return "Quincenal (26/año)";
  if (f === 52) return "Semanal (52/año)";
  return `${f} operaciones/año`;
}

// Iconos SVG limpios para acciones
const SVG_EDIT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
const SVG_DELETE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

// ==========================================
// PERSISTENCIA DE DATOS
// ==========================================
async function initApp() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error("Error al consultar el servidor");
    state = await res.json();
    if (dom.monedaSelect) dom.monedaSelect.value = state.moneda || "€";
    actualizarSimbolosMoneda();
    render();
  } catch (err) {
    console.error("Error al cargar datos:", err);
    render();
  }
}

function queueSave() {
  if (dom.saveStatus) {
    dom.saveStatus.textContent = "Sincronizando...";
    dom.saveStatus.className = "status-label saving";
  }
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state)
      });
      if (res.ok) {
        if (dom.saveStatus) {
          dom.saveStatus.textContent = "En línea";
          dom.saveStatus.className = "status-label";
        }
      }
    } catch (e) {
      if (dom.saveStatus) {
        dom.saveStatus.textContent = "Error de red";
        dom.saveStatus.className = "status-label saving";
      }
    }
  }, 300);
}

// ==========================================
// RENDERIZADO PRINCIPAL
// ==========================================
function render() {
  // Consolidación de ingresos
  let totalIngresoAnual = 0;
  state.ingresos.forEach(item => {
    totalIngresoAnual += (Number(item.monto) || 0) * (Number(item.frecuencia) || 1);
  });
  const totalIngresoMensual = totalIngresoAnual / 12;

  // Consolidación de gastos
  let totalGastoAnual = 0;
  let gastoNecesidadesAnual = 0;
  let gastoDeseosAnual = 0;

  state.gastos.forEach(item => {
    const anual = (Number(item.monto) || 0) * (Number(item.frecuencia) || 1);
    totalGastoAnual += anual;
    if (item.tipo === "deseo") {
      gastoDeseosAnual += anual;
    } else {
      gastoNecesidadesAnual += anual;
    }
  });
  const totalGastoMensual = totalGastoAnual / 12;

  // Balance Neto (Superávit / Déficit)
  const balanceNetoAnual = totalIngresoAnual - totalGastoAnual;
  const balanceNetoMensual = totalIngresoMensual - totalGastoMensual;

  // KPIs Primarios
  dom.totalIngresoAnual.textContent = fmtDinero(totalIngresoAnual);
  dom.totalIngresoMensual.textContent = `${fmtDinero(totalIngresoMensual)} / mes`;

  dom.totalGastoAnual.textContent = fmtDinero(totalGastoAnual);
  dom.totalGastoMensual.textContent = `${fmtDinero(totalGastoMensual)} / mes`;

  dom.balanceNetoAnual.textContent = fmtDinero(balanceNetoAnual);
  dom.balanceNetoMensual.textContent = `${fmtDinero(balanceNetoMensual)} / mes`;

  const balanceValEl = dom.balanceNetoAnual;
  if (totalIngresoAnual === 0 && totalGastoAnual === 0) {
    balanceValEl.className = "kpi-primary-val";
  } else if (balanceNetoAnual >= 0) {
    balanceValEl.className = "kpi-primary-val positive";
  } else {
    balanceValEl.className = "kpi-primary-val negative";
  }

  // Tasa de Retención de Capital (%)
  let tasaAhorro = 0;
  if (totalIngresoAnual > 0) {
    tasaAhorro = (balanceNetoAnual / totalIngresoAnual) * 100;
  }
  dom.tasaAhorroPorcentaje.textContent = `${tasaAhorro.toFixed(1)}%`;

  let diagTexto = "";
  if (totalIngresoAnual === 0 && totalGastoAnual === 0) {
    diagTexto = "Registre ingresos y obligaciones para generar la auditoría de flujo.";
  } else if (tasaAhorro >= 25) {
    diagTexto = "Tasa de capitalización alta. Amplio margen operativo para inversión y reserva de liquidez.";
  } else if (tasaAhorro >= 15) {
    diagTexto = "Estructura equilibrada. Flujo neto alineado con los estándares de ahorro recomendados.";
  } else if (tasaAhorro >= 0) {
    diagTexto = "Margen operativo estrecho. Alta sensibilidad ante contingencias o gastos imprevistos.";
  } else {
    diagTexto = "Flujo de caja deficitario. Las obligaciones anualizadas superan la base de ingresos.";
  }
  dom.tasaAhorroDiagnostico.textContent = diagTexto;

  // Matriz de asignación (Regla 50/30/20)
  renderEstructura(totalIngresoAnual, gastoNecesidadesAnual, gastoDeseosAnual, balanceNetoAnual);

  // Libros de registro
  renderListaIngresos(totalIngresoMensual, totalIngresoAnual);
  renderListaGastos(totalGastoMensual, totalGastoAnual);

  // Analítica y Previsiones
  renderDesgloseCategorias(totalGastoAnual);
  renderProyecciones(balanceNetoMensual, gastoDeseosAnual);
}

function renderEstructura(ingresoAnual, necAnual, desAnual, ahorroAnual) {
  if (ingresoAnual <= 0) {
    dom.barNecesidad.style.width = "0%";
    dom.barDeseo.style.width = "0%";
    dom.barAhorro.style.width = "0%";
    dom.pctNecesidad.textContent = "0.0%";
    dom.pctDeseo.textContent = "0.0%";
    dom.pctAhorro.textContent = "0.0%";
    dom.structureAnalysis.innerHTML = "Registre sus fuentes de ingresos para calcular la distribución porcentual de los recursos consolidados.";
    return;
  }

  const pNec = Math.min(100, Math.max(0, (necAnual / ingresoAnual) * 100));
  const pDes = Math.min(100 - pNec, Math.max(0, (desAnual / ingresoAnual) * 100));
  const pAho = Math.max(0, 100 - pNec - pDes);

  dom.barNecesidad.style.width = `${pNec}%`;
  dom.barDeseo.style.width = `${pDes}%`;
  dom.barAhorro.style.width = `${pAho}%`;

  dom.pctNecesidad.textContent = `${pNec.toFixed(1)}%`;
  dom.pctDeseo.textContent = `${pDes.toFixed(1)}%`;
  dom.pctAhorro.textContent = `${pAho.toFixed(1)}%`;

  let recomendacion = "";
  if (pNec > 55) {
    recomendacion = `Los compromisos estructurales fijos absorben el <strong>${pNec.toFixed(1)}%</strong> de sus ingresos consolidados (umbral de referencia: 50%).`;
  } else {
    recomendacion = `La estructura de gastos esenciales se encuentra bajo control en un <strong>${pNec.toFixed(1)}%</strong>.`;
  }

  dom.structureAnalysis.innerHTML = `
    <span><strong>Auditoría de Asignación:</strong> ${recomendacion} El remanente neto para capitalización y liquidez es de <strong>${fmtDinero(ahorroAnual / 12)} / mes</strong> (<strong>${fmtDinero(ahorroAnual)} / año</strong>).</span>
  `;
}

function renderListaIngresos(totalMensual, totalAnual) {
  dom.listaIngresos.innerHTML = "";
  if (state.ingresos.length === 0) {
    dom.listaIngresos.innerHTML = '<div class="empty-ledger">Sin ingresos registrados. Pulse "+ Añadir Ingreso" para registrar la primera entrada.</div>';
    dom.colTotalIngresos.textContent = `0,00 ${state.moneda} / mes (0,00 ${state.moneda} / año)`;
    return;
  }

  state.ingresos.forEach(item => {
    const f = Number(item.frecuencia) || 1;
    const monto = Number(item.monto) || 0;
    const anual = monto * f;
    const mensual = anual / 12;

    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-details">
        <div class="entry-title-row">
          <span class="entry-name">${escapeHtml(item.concepto)}</span>
          <span class="tag-badge">${escapeHtml(item.categoria || "Nómina")}</span>
          <span class="tag-freq">${labelFrecuencia(f)}</span>
        </div>
        ${item.descripcion ? `<span class="entry-note">${escapeHtml(item.descripcion)}</span>` : ""}
      </div>
      <div class="entry-figures">
        <span class="figure-primary fig-inflow">+${fmtDinero(mensual)}/mes</span>
        <span class="figure-secondary">${fmtDinero(anual)}/año &bull; (${fmtDinero(monto)}/cobro)</span>
      </div>
      <div class="entry-ops">
        <button class="op-btn" title="Editar registro" onclick="abrirEditarIngreso('${item.id}')">${SVG_EDIT}</button>
        <button class="op-btn op-btn-danger" title="Eliminar registro" onclick="eliminarIngreso('${item.id}')">${SVG_DELETE}</button>
      </div>
    `;
    dom.listaIngresos.appendChild(card);
  });

  dom.colTotalIngresos.textContent = `${fmtDinero(totalMensual)} / mes (${fmtDinero(totalAnual)} / año)`;
}

function renderListaGastos(totalMensual, totalAnual) {
  dom.listaGastos.innerHTML = "";
  
  const filtrados = state.gastos.filter(item => {
    if (currentGastoFilter === "todos") return true;
    return item.tipo === currentGastoFilter;
  });

  if (filtrados.length === 0) {
    dom.listaGastos.innerHTML = '<div class="empty-ledger">Sin compromisos en este segmento. Pulse "+ Añadir Gasto" para registrar una obligación.</div>';
  } else {
    filtrados.forEach(item => {
      const f = Number(item.frecuencia) || 1;
      const monto = Number(item.monto) || 0;
      const anual = monto * f;
      const mensual = anual / 12;
      const esDeseo = item.tipo === "deseo";

      const card = document.createElement("div");
      card.className = "entry-card";
      card.innerHTML = `
        <div class="entry-details">
          <div class="entry-title-row">
            <span class="entry-name">${escapeHtml(item.concepto)}</span>
            <span class="tag-badge">${escapeHtml(item.categoria || "General")}</span>
            <span class="tag-badge ${esDeseo ? "tag-discretionary" : "tag-essential"}">
              ${esDeseo ? "Discrecional" : "Estructural"}
            </span>
            <span class="tag-freq">${labelFrecuencia(f)}</span>
          </div>
          ${item.descripcion ? `<span class="entry-note">${escapeHtml(item.descripcion)}</span>` : ""}
        </div>
        <div class="entry-figures">
          <span class="figure-primary fig-outflow">-${fmtDinero(mensual)}/mes</span>
          <span class="figure-secondary">${fmtDinero(anual)}/año &bull; (${fmtDinero(monto)}/pago)</span>
        </div>
        <div class="entry-ops">
          <button class="op-btn" title="Editar registro" onclick="abrirEditarGasto('${item.id}')">${SVG_EDIT}</button>
          <button class="op-btn op-btn-danger" title="Eliminar registro" onclick="eliminarGasto('${item.id}')">${SVG_DELETE}</button>
        </div>
      `;
      dom.listaGastos.appendChild(card);
    });
  }

  dom.colTotalGastos.textContent = `${fmtDinero(totalMensual)} / mes (${fmtDinero(totalAnual)} / año)`;
}

function renderDesgloseCategorias(totalGastoAnual) {
  dom.desgloseCategorias.innerHTML = "";
  if (totalGastoAnual <= 0 || state.gastos.length === 0) {
    dom.desgloseCategorias.innerHTML = '<p class="empty-ledger">Sin gastos consolidados para desglosar.</p>';
    return;
  }

  const catMap = {};
  state.gastos.forEach(g => {
    const cat = g.categoria || "Otros";
    const anual = (Number(g.monto) || 0) * (Number(g.frecuencia) || 1);
    catMap[cat] = (catMap[cat] || 0) + anual;
  });

  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([cat, valAnual]) => {
    const pct = ((valAnual / totalGastoAnual) * 100).toFixed(1);
    const mensual = valAnual / 12;

    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `
      <div class="category-meta">
        <span><strong>${escapeHtml(cat)}</strong> (${pct}%)</span>
        <span>${fmtDinero(mensual)}/mes &bull; ${fmtDinero(valAnual)}/año</span>
      </div>
      <div class="category-track">
        <div class="category-fill" style="width: ${pct}%;"></div>
      </div>
    `;
    dom.desgloseCategorias.appendChild(row);
  });
}

function renderProyecciones(ahorroMensual, deseosAnual) {
  const m3 = Math.max(0, ahorroMensual * 3);
  const m6 = Math.max(0, ahorroMensual * 6);
  const a1 = Math.max(0, ahorroMensual * 12);
  const a3 = Math.max(0, ahorroMensual * 36);

  dom.proj3m.textContent = fmtDinero(m3);
  dom.proj6m.textContent = fmtDinero(m6);
  dom.proj1y.textContent = fmtDinero(a1);
  dom.proj3y.textContent = fmtDinero(a3);

  const pctRecorte = Number(dom.sliderRecorte.value) || 10;
  dom.labelRecorte.textContent = pctRecorte;

  const ahorroExtraAnual = (deseosAnual * pctRecorte) / 100;
  const ahorroExtraMensual = ahorroExtraAnual / 12;

  if (deseosAnual <= 0) {
    dom.simResult.innerHTML = `Registre compromisos discrecionales para proyectar la optimización del capital disponible.`;
  } else {
    dom.simResult.innerHTML = `
      Una optimización del <strong>${pctRecorte}%</strong> en partidas discrecionales liberaría 
      <strong>+${fmtDinero(ahorroExtraMensual)}/mes</strong> adicionales hacia el fondo de liquidez (<strong>+${fmtDinero(ahorroExtraAnual)}/año</strong>).
    `;
  }
}

// ==========================================
// MODAL DE INGRESOS
// ==========================================
function abrirModalIngreso() {
  dom.modalIngresoTitle.textContent = "Registrar Ingreso";
  dom.ingresoId.value = "";
  dom.ingresoConcepto.value = "";
  dom.ingresoCategoria.value = "Nómina";
  dom.ingresoMonto.value = "";
  dom.ingresoFrecuenciaPreset.value = "12";
  dom.ingresoFrecuencia.value = "12";
  dom.groupIngresoCustomFreq.style.display = "none";
  dom.ingresoDescripcion.value = "";
  actualizarLivePreviewIngreso();
  dom.modalIngreso.classList.add("active");
  dom.ingresoConcepto.focus();
}

function abrirEditarIngreso(id) {
  const item = state.ingresos.find(i => i.id === id);
  if (!item) return;

  dom.modalIngresoTitle.textContent = "Modificar Ingreso";
  dom.ingresoId.value = item.id;
  dom.ingresoConcepto.value = item.concepto;
  dom.ingresoCategoria.value = item.categoria || "Nómina";
  dom.ingresoMonto.value = item.monto;

  const freq = String(item.frecuencia);
  const standardFreqs = ["12", "14", "1", "2", "4", "26", "52"];
  if (standardFreqs.includes(freq)) {
    dom.ingresoFrecuenciaPreset.value = freq;
    dom.groupIngresoCustomFreq.style.display = "none";
  } else {
    dom.ingresoFrecuenciaPreset.value = "custom";
    dom.groupIngresoCustomFreq.style.display = "flex";
  }
  dom.ingresoFrecuencia.value = freq;
  dom.ingresoDescripcion.value = item.descripcion || "";

  actualizarLivePreviewIngreso();
  dom.modalIngreso.classList.add("active");
}

function actualizarFrecuenciaIngreso(val) {
  if (val === "custom") {
    dom.groupIngresoCustomFreq.style.display = "flex";
  } else {
    dom.groupIngresoCustomFreq.style.display = "none";
    dom.ingresoFrecuencia.value = val;
  }
  actualizarLivePreviewIngreso();
}

function actualizarLivePreviewIngreso() {
  const monto = parseFloat(dom.ingresoMonto.value) || 0;
  const freq = parseFloat(dom.ingresoFrecuencia.value) || 12;
  const anual = monto * freq;
  const mensual = anual / 12;
  dom.previewIngresoAnual.textContent = "+" + fmtDinero(anual);
  dom.previewIngresoMensual.textContent = "+" + fmtDinero(mensual);
}

function guardarIngreso(e) {
  e.preventDefault();
  const id = dom.ingresoId.value || "ing_" + Date.now();
  const concepto = dom.ingresoConcepto.value.trim();
  const categoria = dom.ingresoCategoria.value;
  const monto = parseFloat(dom.ingresoMonto.value) || 0;
  const frecuencia = parseInt(dom.ingresoFrecuencia.value, 10) || 12;
  const descripcion = dom.ingresoDescripcion.value.trim();

  if (!concepto || monto <= 0 || frecuencia <= 0) {
    alert("Por favor indique el concepto y un importe numérico válido.");
    return;
  }

  const existingIdx = state.ingresos.findIndex(i => i.id === id);
  const payload = { id, concepto, categoria, monto, frecuencia, descripcion };

  if (existingIdx >= 0) {
    state.ingresos[existingIdx] = payload;
  } else {
    state.ingresos.push(payload);
  }

  cerrarModales();
  render();
  queueSave();
}

function eliminarIngreso(id) {
  if (!confirm("¿Desea eliminar este registro de ingresos?")) return;
  state.ingresos = state.ingresos.filter(i => i.id !== id);
  render();
  queueSave();
}

// ==========================================
// MODAL DE GASTOS
// ==========================================
function seleccionarTipoGasto(tipo) {
  if (dom.gastoTipo) dom.gastoTipo.value = tipo;
  const btnNec = document.getElementById("typeBtnNecesidad");
  const btnDes = document.getElementById("typeBtnDeseo");
  if (!btnNec || !btnDes) return;

  if (tipo === "deseo") {
    btnNec.className = "segment-btn necesidad";
    btnDes.className = "segment-btn active deseo";
  } else {
    btnNec.className = "segment-btn active necesidad";
    btnDes.className = "segment-btn deseo";
  }
}

function abrirModalGasto() {
  dom.modalGastoTitle.textContent = "Registrar Gasto";
  dom.gastoId.value = "";
  dom.gastoConcepto.value = "";
  dom.gastoCategoria.value = "Vivienda";
  seleccionarTipoGasto("necesidad");
  dom.gastoMonto.value = "";
  dom.gastoFrecuenciaPreset.value = "12";
  dom.gastoFrecuencia.value = "12";
  dom.groupGastoCustomFreq.style.display = "none";
  dom.gastoDescripcion.value = "";
  actualizarLivePreviewGasto();
  dom.modalGasto.classList.add("active");
  dom.gastoConcepto.focus();
}

function abrirEditarGasto(id) {
  const item = state.gastos.find(g => g.id === id);
  if (!item) return;

  dom.modalGastoTitle.textContent = "Modificar Gasto";
  dom.gastoId.value = item.id;
  dom.gastoConcepto.value = item.concepto;
  dom.gastoCategoria.value = item.categoria || "Vivienda";
  seleccionarTipoGasto(item.tipo || "necesidad");
  dom.gastoMonto.value = item.monto;

  const freq = String(item.frecuencia);
  const standardFreqs = ["12", "1", "2", "4", "26", "52"];
  if (standardFreqs.includes(freq)) {
    dom.gastoFrecuenciaPreset.value = freq;
    dom.groupGastoCustomFreq.style.display = "none";
  } else {
    dom.gastoFrecuenciaPreset.value = "custom";
    dom.groupGastoCustomFreq.style.display = "flex";
  }
  dom.gastoFrecuencia.value = freq;
  dom.gastoDescripcion.value = item.descripcion || "";

  actualizarLivePreviewGasto();
  dom.modalGasto.classList.add("active");
}

function actualizarFrecuenciaGasto(val) {
  if (val === "custom") {
    dom.groupGastoCustomFreq.style.display = "flex";
  } else {
    dom.groupGastoCustomFreq.style.display = "none";
    dom.gastoFrecuencia.value = val;
  }
  actualizarLivePreviewGasto();
}

function actualizarLivePreviewGasto() {
  const monto = parseFloat(dom.gastoMonto.value) || 0;
  const freq = parseFloat(dom.gastoFrecuencia.value) || 12;
  const anual = monto * freq;
  const mensual = anual / 12;
  dom.previewGastoAnual.textContent = "-" + fmtDinero(anual);
  dom.previewGastoMensual.textContent = "-" + fmtDinero(mensual);
}

function guardarGasto(e) {
  e.preventDefault();
  const id = dom.gastoId.value || "gas_" + Date.now();
  const concepto = dom.gastoConcepto.value.trim();
  const categoria = dom.gastoCategoria.value;
  const tipo = dom.gastoTipo.value;
  const monto = parseFloat(dom.gastoMonto.value) || 0;
  const frecuencia = parseInt(dom.gastoFrecuencia.value, 10) || 12;
  const descripcion = dom.gastoDescripcion.value.trim();

  if (!concepto || monto <= 0 || frecuencia <= 0) {
    alert("Por favor indique el concepto y un importe numérico válido.");
    return;
  }

  const existingIdx = state.gastos.findIndex(g => g.id === id);
  const payload = { id, concepto, categoria, tipo, monto, frecuencia, descripcion };

  if (existingIdx >= 0) {
    state.gastos[existingIdx] = payload;
  } else {
    state.gastos.push(payload);
  }

  cerrarModales();
  render();
  queueSave();
}

function eliminarGasto(id) {
  if (!confirm("¿Desea eliminar este registro de gastos?")) return;
  state.gastos = state.gastos.filter(g => g.id !== id);
  render();
  queueSave();
}

function cerrarModales() {
  dom.modalIngreso.classList.remove("active");
  dom.modalGasto.classList.remove("active");
}

function actualizarSimbolosMoneda() {
  document.querySelectorAll(".currency-symbol").forEach(el => {
    el.textContent = state.moneda;
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#039;";
      default: return m;
    }
  });
}

// ==========================================
// REGISTRO DE EVENTOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initApp();

  dom.btnNuevoIngreso.addEventListener("click", abrirModalIngreso);
  dom.btnNuevoGasto.addEventListener("click", abrirModalGasto);

  // Previsualizaciones en tiempo real
  dom.ingresoMonto.addEventListener("input", actualizarLivePreviewIngreso);
  dom.ingresoFrecuencia.addEventListener("input", actualizarLivePreviewIngreso);
  dom.gastoMonto.addEventListener("input", actualizarLivePreviewGasto);
  dom.gastoFrecuencia.addEventListener("input", actualizarLivePreviewGasto);

  // Barra de filtros de gastos
  document.querySelectorAll(".filter-tab").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      currentGastoFilter = e.target.dataset.filter;
      render();
    });
  });

  // Selector de moneda
  dom.monedaSelect.addEventListener("change", (e) => {
    state.moneda = e.target.value;
    actualizarSimbolosMoneda();
    render();
    queueSave();
  });

  // Slider de optimización
  dom.sliderRecorte.addEventListener("input", () => {
    render();
  });

  // Exportar JSON
  dom.btnExportar.addEventListener("click", () => {
    window.location.href = "/api/export";
  });

  // Importar JSON
  dom.btnImportarTrigger.addEventListener("click", () => {
    dom.fileImport.click();
  });

  dom.fileImport.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed.ingresos && parsed.gastos) {
          state = parsed;
          if (dom.monedaSelect) dom.monedaSelect.value = state.moneda || "€";
          actualizarSimbolosMoneda();
          render();
          queueSave();
          alert("Base de datos importada correctamente.");
        } else {
          alert("El archivo no posee una estructura de datos válida.");
        }
      } catch (err) {
        alert("Error al procesar el archivo: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // Reiniciar datos a blanco
  dom.btnReiniciar.addEventListener("click", async () => {
    if (!confirm("¿Desea restablecer los registros a cero? Esta acción limpiará los datos actuales.")) return;
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        const r = await res.json();
        state = r.data;
        if (dom.monedaSelect) dom.monedaSelect.value = state.moneda || "€";
        actualizarSimbolosMoneda();
        render();
      }
    } catch (e) {
      alert("Error al restablecer los datos.");
    }
  });

  // Tecla ESC y clics en fondo para cerrar modales
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModales();
  });

  dom.modalIngreso.addEventListener("click", (e) => {
    if (e.target === dom.modalIngreso) cerrarModales();
  });
  dom.modalGasto.addEventListener("click", (e) => {
    if (e.target === dom.modalGasto) cerrarModales();
  });
});
