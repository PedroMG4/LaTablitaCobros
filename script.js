// === Utils ===
const $  = (s) => document.querySelector(s);

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
const elQuesoCremoso = $("#montoQuesoCremoso");
const elQuesoBarra   = $("#montoQuesoBarra");
const elMetodo       = $("#metodo");
const contOtras      = $("#otrasContainer");

const btnAdd   = $("#addOtro");
const btnCalc  = $("#btnCalcular");
const btnClear = $("#btnLimpiar");

const elBruto = $("#totalBruto");
const elDesc  = $("#descuento");
const elFinal = $("#totalFinal");

// === Lógica de "otras cosas" dinámicas ===
function wireOtrasRow(row) {
  const input  = row.querySelector("input.otras");
  const remove = row.querySelector("button.remove");

  input.addEventListener("input", calcular);
  remove.addEventListener("click", () => {
    row.remove();
    // Siempre dejar al menos una fila
    if (contOtras.querySelectorAll(".otras-row").length === 0) {
      addOtrasInput("");
    }
    calcular();
  });
}

function addOtrasInput(value = "") {
  const row = document.createElement("div");
  row.className = "otras-row";
  row.innerHTML = `
    <input class="otras" type="number" min="0" step="10" placeholder="Ej: 0.00" inputmode="decimal" />
    <button type="button" class="btn-ghost remove">✕</button>
  `;
  contOtras.appendChild(row);
  const input = row.querySelector("input.otras");
  input.value = value;
  wireOtrasRow(row);
}

contOtras.querySelectorAll(".otras-row").forEach(wireOtrasRow);
btnAdd.addEventListener("click", () => addOtrasInput(""));

// === Cálculo principal ===
function calcular() {
  // Sumar quesos (cremoso + barra)
  const quesoCremoso = parseMonto(elQuesoCremoso.value);
  const quesoBarra   = parseMonto(elQuesoBarra.value);
  const totalQuesos  = quesoCremoso + quesoBarra;

  // Sumar todas las "otras cosas"
  let totalOtras = 0;
  contOtras.querySelectorAll("input.otras").forEach(inp => {
    totalOtras += parseMonto(inp.value);
  });

  // Total bruto (todo junto)
  const totalBruto = totalQuesos + totalOtras;

  // Descuento 5% SOLO sobre "otras cosas" si el método es efectivo o MP
  const metodo = elMetodo.value;
  const aplicaDescuento = (metodo === "efectivo" || metodo === "mercadopago");
  const montoDescuento  = aplicaDescuento ? (totalOtras * 0.05) : 0;

  // Total final
  const totalFinal = totalBruto - montoDescuento;

  // Actualizar UI
  elBruto.textContent = formatARS(totalBruto);
  elDesc.textContent  = formatARS(montoDescuento);
  elFinal.textContent = formatARS(totalFinal);

  // Logs solicitados
  console.clear();
  console.log("=== RESUMEN PEDIDO ===");
  console.log(`Total del pedido (quesos + otras): ${formatARS(totalBruto)}`);
  console.log(`Monto a descontar (solo 'otras'): ${formatARS(montoDescuento)}`);
  console.log(`Total final: ${formatARS(totalFinal)}`);
}

// === Listeners ===
[elQuesoCremoso, elQuesoBarra].forEach(el => el.addEventListener("input", calcular));
elMetodo.addEventListener("change", calcular);
btnCalc.addEventListener("click", calcular);

// Limpiar todo
btnClear.addEventListener("click", () => {
  elQuesoCremoso.value = "";
  elQuesoBarra.value   = "";
  elMetodo.value       = "";

  // Resetear "otras": dejar 1 fila vacía
  contOtras.innerHTML = "";
  addOtrasInput("");

  calcular();
});

// Estado inicial
calcular();
