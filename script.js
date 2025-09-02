// === Utils ===
const $ = (s) => document.querySelector(s);

function parseMonto(v) {
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}
function formatARS(n) {
  return n.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
}

// === Elementos del DOM ===
const elQuesoCremoso   = $("#montoQuesoCremoso");
const elQuesoBarra     = $("#montoQuesoBarra");
const contColitas      = $("#colitasContainer");
const contOtras        = $("#otrasContainer");
const elMetodo         = $("#metodo");
const elPorcentaje     = $("#porcentajeDesc");   // NUEVO
const elPorcView       = $("#porcView");         // NUEVO

const btnAddColita     = $("#addOtra");
const btnAddOtra       = $("#addOtro");
const btnCalc          = $("#btnCalcular");
const btnClear         = $("#btnLimpiar");

const elBruto          = $("#totalBruto");
const elDesc           = $("#descuento");
const elFinal          = $("#totalFinal");

// === Filas dinámicas (sin cambios de lógica) ===
function wireOtraRow(row) {
  const input  = row.querySelector("input.otra");
  const remove = row.querySelector("button.remove-otra");
  input.addEventListener("input", calcular);
  remove.addEventListener("click", () => {
    row.remove();
    if (contOtras.querySelectorAll(".otras-row").length === 0) addOtraInput("");
    calcular();
  });
}
function addOtraInput(value = "") {
  const row = document.createElement("div");
  row.className = "otras-row";
  row.innerHTML = `
    <input class="otra" type="number" min="0" step="10" placeholder="Ej: 0.00" inputmode="decimal" />
    <button type="button" class="btn-ghost remove-otra" aria-label="Quitar producto">✕</button>
  `;
  contOtras.appendChild(row);
  const input = row.querySelector("input.otra");
  input.value = value;
  wireOtraRow(row);
}

function wireColitaRow(row) {
  const input  = row.querySelector("input.colita");
  const remove = row.querySelector("button.remove-colita");
  input.addEventListener("input", calcular);
  remove.addEventListener("click", () => {
    row.remove();
    if (contColitas.querySelectorAll(".colita-row").length === 0) addColitaInput("");
    calcular();
  });
}
function addColitaInput(value = "") {
  const row = document.createElement("div");
  row.className = "colita-row";
  row.innerHTML = `
    <input class="colita" type="number" min="0" step="10" placeholder="Ej: 0.00" inputmode="decimal" />
    <button type="button" class="btn-ghost remove-colita" aria-label="Quitar retazo">✕</button>
  `;
  contColitas.appendChild(row);
  const input = row.querySelector("input.colita");
  input.value = value;
  wireColitaRow(row);
}

contOtras.querySelectorAll(".otras-row").forEach(wireOtraRow);
contColitas.querySelectorAll(".colita-row").forEach(wireColitaRow);
btnAddOtra.addEventListener("click", () => addOtraInput(""));
btnAddColita.addEventListener("click", () => addColitaInput(""));

// === Cálculo principal (ajuste de porcentaje) ===
function calcular() {
  const quesoCremoso = parseMonto(elQuesoCremoso.value);
  const quesoBarra   = parseMonto(elQuesoBarra.value);
  const totalQuesos  = quesoCremoso + quesoBarra;

  let totalColitas = 0;
  contColitas.querySelectorAll("input.colita").forEach(inp => totalColitas += parseMonto(inp.value));

  let totalOtras = 0;
  contOtras.querySelectorAll("input.otra").forEach(inp => totalOtras += parseMonto(inp.value));

  const totalBruto = totalQuesos + totalColitas + totalOtras;

  // % elegido
  const porc = parseFloat(elPorcentaje.value || "0"); // 0..100
  const aplicaDescuento = (elMetodo.value === "efectivo" || elMetodo.value === "mercadopago");
  const montoDescuento  = aplicaDescuento ? (totalOtras * (porc / 100)) : 0;

  const totalFinal = totalBruto - montoDescuento;

  // UI
  elBruto.textContent = formatARS(totalBruto);
  elDesc.textContent  = formatARS(montoDescuento);
  elFinal.textContent = formatARS(totalFinal);
  if (elPorcView) elPorcView.textContent = `${porc}%`;

  // Logs
  console.clear();
  console.log("=== RESUMEN PEDIDO ===");
  console.log(`Quesos: ${formatARS(totalQuesos)} (Cremoso: ${formatARS(quesoCremoso)} | Barra: ${formatARS(quesoBarra)})`);
  console.log(`Retazos de fiambre: ${formatARS(totalColitas)}`);
  console.log(`Otras cosas: ${formatARS(totalOtras)}`);
  console.log(`% descuento elegido: ${porc}% (aplica solo sobre "otras" con efectivo/MP)`);
  console.log(`Total bruto: ${formatARS(totalBruto)}`);
  console.log(`Descuento aplicado: ${formatARS(montoDescuento)}`);
  console.log(`Total final: ${formatARS(totalFinal)}`);
}

// Listeners
[elQuesoCremoso, elQuesoBarra].forEach(el => el.addEventListener("input", calcular));
elMetodo.addEventListener("change", calcular);
elPorcentaje.addEventListener("change", calcular); // NUEVO
btnCalc.addEventListener("click", calcular);

// Limpiar
btnClear.addEventListener("click", () => {
  elQuesoCremoso.value = "";
  elQuesoBarra.value   = "";
  elMetodo.value       = "";
  elPorcentaje.value   = "5"; // vuelve al 5% por defecto (ajustá si querés otro)

  contOtras.innerHTML = "";
  contColitas.innerHTML = "";
  addOtraInput("");
  addColitaInput("");

  calcular();
});

// Estado inicial
calcular();
