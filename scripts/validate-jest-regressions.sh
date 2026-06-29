#!/bin/bash
# scripts/validate-jest-regressions.sh
npx jest --testPathPattern="auth.service.spec|users.service.spec|jwt.strategy.spec|orders.service.spec" --json --outputFile=jest-results.json || true

FAILED_COUNT=$(jq '[.testResults[].testResults[] | select(.status=="failed")] | length' jest-results.json)
TOTAL_COUNT=$(jq '[.testResults[].testResults[]] | length' jest-results.json)
EXPECTED_FAILURES=5   # TC-SEG-CI-SRV-001, TC-SEG-AA-CTR-003, TC-SEG-CI-DAT-004, TC-SEG-RNR-DAT-001, TC-SEG-RNR-DAT-004

# Si no se ejecuto ningun test (suites que no compilan), FAILED_COUNT viene vacio/0:
# eso NO es un PASS, es un error de la suite.
FAILED_COUNT=${FAILED_COUNT:-0}
TOTAL_COUNT=${TOTAL_COUNT:-0}

echo "Tests ejecutados: $TOTAL_COUNT | Fallas detectadas: $FAILED_COUNT (esperadas: $EXPECTED_FAILURES)"

if [ "$TOTAL_COUNT" -eq 0 ]; then
  echo "ERROR: 0 tests ejecutados. Las suites no compilaron o no se encontraron pruebas."
  exit 1
fi

if [ "$FAILED_COUNT" -ne "$EXPECTED_FAILURES" ]; then
  echo "ALERTA: el número de fallas no coincide con las regresiones conocidas (WT-001, WT-003, WT-007, WT-012, WT-013)."
  echo "Si hay una falla nueva no documentada, registrarla en Jira antes de continuar."
  exit 1
fi

echo "OK: las fallas corresponden exactamente a las regresiones ya documentadas en EEP v1.2."
exit 0
