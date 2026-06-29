#!/bin/bash
set -e

echo "=== TC-SEG-CI-A2-01: Verificando ausencia de raw queries inseguras ==="
RAW_QUERIES=$(grep -rn '\$queryRaw\|\$executeRaw' --include='*.ts' src/ || true)
if [ -n "$RAW_QUERIES" ]; then
  echo "Se encontraron raw queries. Revisar manualmente si usan parametrización segura:"
  echo "$RAW_QUERIES"
else
  echo "PASS: 0 raw queries encontradas."
fi

echo ""
echo "=== TC-SEG-AA-A3-03: Verificando que JWT_SECRET no esté hardcodeado ==="
HARDCODED=$(grep -n "jwtSecret = '" src/auth/auth.module.ts || true)
if [ -n "$HARDCODED" ]; then
  echo "FAIL (esperado, hallazgo WT-001 ya confirmado): secreto hardcodeado encontrado:"
  echo "$HARDCODED"
  exit 1
else
  echo "PASS: no se encontró secreto hardcodeado."
fi

echo ""
echo "=== Verificando si .env está commiteado ==="
if git ls-files | grep -q '^\.env$'; then
  echo "FAIL (esperado, hallazgo WT-002 ya confirmado): .env está commiteado en el repositorio."
  exit 1
else
  echo "PASS: .env no está en el repositorio."
fi
