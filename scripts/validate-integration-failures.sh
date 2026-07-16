#!/bin/bash
# scripts/validate-integration-failures.sh
#
# Puerta de calidad de las pruebas de INTEGRACIÓN (EEP-SEG-2026-001 v1.4).
#
# Dos diferencias deliberadas frente a validate-jest-regressions.sh:
#
#  1. Compara el CONJUNTO EXACTO de TC-IDs que fallan, no sólo cuántos fallan.
#     Contar no basta: si un caso esperado empieza a pasar y otro distinto
#     empieza a fallar, el total no cambia y la regresión pasaría inadvertida
#     — justamente el riesgo que el Paso 3 del plan de cierre pide cubrir.
#
#  2. No depende de `jq` (que no está instalado en todos los entornos y hace
#     que el script sólo corra en CI). Usa `node`, que este proyecto garantiza.
#     Así la misma puerta se puede correr en local antes de hacer push.
#
# Fallas esperadas y su causa (ver Informe de Ejecución de Integración Ciclo 1):
#   WT-007 — @UseGuards(JwtAuthGuard) comentado en orders.controller.ts:
#     TC-SEG-AA-A1-02, TC-SEG-AA-A3-01, TC-SEG-AA-A3-02,
#     TC-SEG-AA-A4-01, TC-SEG-AA-A4-02, TC-SEG-RNR-A4-01, TC-SEG-RNR-A4-02
#   NUEVO — validación de entrada insuficiente (CWE-20): CreateUserDto.email
#   sin @IsEmail() (src/users/dto/create-user.dto.ts):
#     TC-SEG-CI-A1-02
#
# Se esperan como PASA: TC-SEG-CI-A1-01, TC-SEG-CI-A3-01.

RESULTS_FILE="integration-results.json"

npm run test:integration -- --json --outputFile="$RESULTS_FILE" > /dev/null 2>&1 || true

if [ ! -f "$RESULTS_FILE" ]; then
  echo "ERROR: no se generó $RESULTS_FILE. La suite no llegó a ejecutarse."
  exit 1
fi

node - "$RESULTS_FILE" <<'NODE'
const fs = require('fs');

const EXPECTED_FAILING = [
  'TC-SEG-AA-A1-02',
  'TC-SEG-AA-A3-01',
  'TC-SEG-AA-A3-02',
  'TC-SEG-AA-A4-01',
  'TC-SEG-AA-A4-02',
  'TC-SEG-CI-A1-02',
  'TC-SEG-RNR-A4-01',
  'TC-SEG-RNR-A4-02',
].sort();

let report;
try {
  report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
} catch (e) {
  console.error('ERROR: no se pudo leer/parsear el reporte de jest:', e.message);
  process.exit(1);
}

const total = report.numTotalTests || 0;
const failed = report.numFailedTests || 0;

// 0 tests ejecutados NO es un PASS: significa que las suites no compilaron.
if (total === 0) {
  console.error('ERROR: 0 tests ejecutados. Las suites no compilaron o no se encontraron pruebas.');
  process.exit(1);
}

const TC_RE = /TC-SEG-[A-Z]+-A\d+-\d+/;
const actual = [
  ...new Set(
    (report.testResults || [])
      .flatMap((s) => s.assertionResults || [])
      .filter((a) => a.status === 'failed')
      .map((a) => (a.fullName.match(TC_RE) || [])[0])
      .filter(Boolean),
  ),
].sort();

console.log(`Tests ejecutados: ${total} | Aserciones fallidas: ${failed}`);
console.log(`TC-IDs fallando: ${actual.length} (esperados: ${EXPECTED_FAILING.length})`);

const noLongerFailing = EXPECTED_FAILING.filter((id) => !actual.includes(id));
const newFailures = actual.filter((id) => !EXPECTED_FAILING.includes(id));

// Aserciones fallidas sin TC-ID reconocible: probable error de arnés, no un
// hallazgo de seguridad. No debe pasar la puerta silenciosamente.
const unlabelled = (report.testResults || [])
  .flatMap((s) => s.assertionResults || [])
  .filter((a) => a.status === 'failed' && !TC_RE.test(a.fullName))
  .map((a) => a.fullName);

if (noLongerFailing.length === 0 && newFailures.length === 0 && unlabelled.length === 0) {
  console.log('OK: fallan exactamente los 8 casos documentados (7 por WT-007 + TC-SEG-CI-A1-02 por CWE-20).');
  process.exit(0);
}

console.error('ALERTA: el conjunto de casos que falla NO coincide con el documentado.');
for (const id of noLongerFailing) {
  console.error(`  YA NO FALLA — ¿corrigió desarrollo el defecto? Actualizar el informe: ${id}`);
}
for (const id of newFailures) {
  console.error(`  FALLA NUEVA NO DOCUMENTADA — registrar en Jira antes de continuar: ${id}`);
}
for (const name of unlabelled) {
  console.error(`  FALLA SIN TC-ID — probable error de arnés, no hallazgo: ${name}`);
}
process.exit(1);
NODE
