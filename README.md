# Gobernanza de ramas — evidencia de pruebas

> **La rama `Pruebas` es la fuente de verdad de toda la evidencia de pruebas dinámicas del proyecto
> (unitarias, integración y caja negra). La rama `main` no se usa para este propósito.**

Esta declaración deja constancia **en el repositorio** de una decisión que el equipo ya había
confirmado a nivel documental (Informe de Pruebas — Análisis de Brechas por Nivel v2, §0 fila 5,
16/07/2026), de modo que sea verificable leyendo el código sin tener que consultar Confluence.

| Aspecto | Decisión |
| --- | --- |
| Rama oficial de evidencia | `Pruebas` |
| Rol de `main` | Código de producto. No se ejecuta ni se reporta evidencia de pruebas sobre ella. |
| CI | El workflow `Security Tests` corre en cada `push` a `Pruebas` (y a `main`). |
| Opción adoptada | **Opción B** del Plan de cierre — declarar `Pruebas` como oficial sin fusionar. |

**No es el cierre de un hallazgo.** H-TEST-05 fue *retirado* el 16/07/2026 y la salvedad de gobernanza
de rama se retiró de todos los niveles, al confirmar el equipo que trabajar en `Pruebas` fue una
decisión deliberada y correcta del proyecto, no una brecha de calidad. Por lo tanto esta declaración
**no genera ninguna salvedad** sobre la calificación de ningún nivel: solo hace explícito en el
repositorio lo que ya era una decisión aceptada.

## Cómo correr las pruebas

```bash
docker compose up -d                 # MariaDB en localhost:3308
npx prisma migrate deploy            # aplica el esquema
npx prisma db seed                   # usuarios + órdenes cruzadas (IDOR)

npm test                             # unitarias  — 17 tests: 12 PASA / 5 FALLA esperadas
npm run test:integration             # integración — 13 tests: 4 PASA / 9 FALLA esperadas
npm run test:integration -- --coverage   # cobertura de integración sobre src/
bash scripts/validate-jest-regressions.sh        # puerta: exactamente 5 fallas unitarias
bash scripts/validate-integration-failures.sh    # puerta: exactamente los 8 TC-IDs documentados
```

> **Las fallas son esperadas y NO deben "arreglarse" en las pruebas.** Reproducen defectos confirmados
> (principalmente **WT-007**: `@UseGuards(JwtAuthGuard)` comentado). Pasarán a verde solas cuando
> desarrollo corrija el código de producción. Si una prueba de este conjunto pasa sin que nadie haya
> tocado `src/`, el defecto está en la prueba, no en el sistema.

---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
