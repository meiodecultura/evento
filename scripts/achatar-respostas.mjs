#!/usr/bin/env node
// Transforma o CSV exportado da tabela "responses" do Supabase (que tem uma
// coluna "answers" com um JSON dentro de cada célula) num CSV "achatado",
// com uma coluna por pergunta — mais fácil de abrir no Excel/Google Sheets.
//
// Uso:
//   node scripts/achatar-respostas.mjs respostas.csv
//   node scripts/achatar-respostas.mjs respostas.csv saida.csv
//
// Veja o passo a passo completo (como exportar o CSV do Supabase) em usando.md.

import { readFileSync, writeFileSync } from 'node:fs';
import Papa from 'papaparse';

const [, , entradaPath, saidaPathArg] = process.argv;

if (!entradaPath) {
  console.error('Uso: node scripts/achatar-respostas.mjs respostas.csv [saida.csv]');
  process.exit(1);
}

const saidaPath = saidaPathArg || entradaPath.replace(/\.csv$/i, '') + '-achatado.csv';

let textoOriginal;
try {
  textoOriginal = readFileSync(entradaPath, 'utf8');
} catch {
  console.error(`Não encontrei o arquivo "${entradaPath}".`);
  process.exit(1);
}

const { data: linhas, errors } = Papa.parse(textoOriginal, {
  header: true,
  skipEmptyLines: true
});

if (errors.length > 0) {
  console.error('Não consegui ler esse CSV:', errors[0].message);
  process.exit(1);
}

if (linhas.length === 0) {
  console.error('O arquivo não tem nenhuma linha de dados.');
  process.exit(1);
}

// Descobre todas as perguntas que aparecem em qualquer linha, pra virarem colunas
const idsDePergunta = new Set();
const linhasComRespostas = linhas.map((linha) => {
  let respostas = {};
  try {
    respostas = JSON.parse(linha.answers ?? '{}');
  } catch {
    // se a célula não for um JSON válido, essa linha fica sem respostas
  }
  for (const id of Object.keys(respostas)) idsDePergunta.add(id);
  return { ...linha, respostas };
});

const colunasDePergunta = [...idsDePergunta].sort();

const linhasAchatadas = linhasComRespostas.map((linha) => {
  const achatada = {
    id: linha.id ?? '',
    data: linha.created_at ?? '',
    evento: linha.event_slug ?? ''
  };
  for (const coluna of colunasDePergunta) {
    achatada[coluna] = linha.respostas[coluna] ?? '';
  }
  return achatada;
});

writeFileSync(saidaPath, Papa.unparse(linhasAchatadas), 'utf8');
console.log(`Pronto! ${linhasAchatadas.length} linha(s) salvas em "${saidaPath}".`);
console.log(`Colunas de pergunta encontradas: ${colunasDePergunta.join(', ') || '(nenhuma)'}`);
