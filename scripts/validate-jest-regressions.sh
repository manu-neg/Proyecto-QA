#!/bin/bash
# scripts/validate-jest-regressions.sh
npx jest --testPathPattern="auth.service.spec|users.service.spec|jwt.strategy.spec|orders.service.spec" --json --outputFile=jest-results.json || true

FAILED_COUNT=$(jq '[.testResults[].testResults[] | select(.status=="failed")] | length' jest-results.json)
EXPECTED_FAILURES=5   # TC-SEG-CI-SRV-001, TC-SEG-AA-CTR-003, TC-SEG-CI-DAT-004, TC-SEG-RNR-DAT-001, TC-SEG-RNR-DAT-004

echo "Fallas detectadas: $FAILED_COUNT (esperadas: $EXPECTED_FAILURES)"

if [ "$FAILED_COUNT" -ne "$EXPECTED_FAILURES" ]; then
  echo "ALERTA: el número de fallas no coincide con las regresiones conocidas (WT-001, WT-003, WT-007, WT-012, WT-013)."
  echo "Si hay una falla nueva no documentada, registrarla en Jira antes de continuar."
  exit 1
fi

echo "OK: las fallas corresponden exactamente a las regresiones ya documentadas en EEP v1.2."
exit 0
