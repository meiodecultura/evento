#!/usr/bin/env node
// Lê eventos.yaml (na raiz do projeto), valida e gera
// src/lib/config/events.generated.ts. Roda automaticamente antes de
// `npm run dev`, `npm run build` e `npm run check` (veja package.json).
//
// Se o YAML tiver algum problema, o script para com uma mensagem em
// português dizendo exatamente o que falta e onde — isso acontece antes de
// qualquer coisa ir para o site, então um evento mal configurado nunca
// chega a ficar visível para quem for tirar foto.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as loadYaml } from 'js-yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const yamlPath = join(root, 'eventos.yaml');
const outPath = join(root, 'src/lib/config/events.generated.ts');

function falhar(mensagem) {
  console.error(`\n❌ Erro em eventos.yaml: ${mensagem}\n`);
  process.exit(1);
}

function textoObrigatorio(valor, onde) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    falhar(`${onde} precisa ser um texto (entre aspas) e não pode ficar em branco.`);
  }
  return valor;
}

let raw;
try {
  raw = readFileSync(yamlPath, 'utf8');
} catch {
  falhar(`não encontrei o arquivo em ${yamlPath}.`);
}

let doc;
try {
  doc = loadYaml(raw);
} catch (err) {
  falhar(
    `o arquivo não é um YAML válido. Isso geralmente é um problema de identação ` +
      `(use espaços, não Tab) ou uma aspa esquecida.\n\nDetalhe técnico: ${err.message}`
  );
}

if (doc === null || doc === undefined) {
  falhar('o arquivo está vazio.');
}
if (typeof doc !== 'object' || Array.isArray(doc)) {
  falhar('o conteúdo do arquivo precisa ser uma lista de eventos (veja o exemplo no topo do arquivo).');
}

const slugs = Object.keys(doc);
if (slugs.length === 0) {
  falhar('nenhum evento encontrado.');
}

const eventos = {};

for (const slug of slugs) {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    falhar(
      `o nome do evento "${slug}" só pode ter letras minúsculas, números e hífen ` +
        `(sem espaço, acento ou maiúscula) — ele vira o endereço do link.`
    );
  }

  const ev = doc[slug];
  const onde = `Evento "${slug}"`;
  if (typeof ev !== 'object' || ev === null || Array.isArray(ev)) {
    falhar(`${onde} está com um formato inesperado — confira a identação.`);
  }

  const nomeDoEvento = textoObrigatorio(ev.nomeDoEvento, `${onde}: "nomeDoEvento"`);
  const tituloBoasVindas = textoObrigatorio(ev.tituloBoasVindas, `${onde}: "tituloBoasVindas"`);
  const subtituloBoasVindas = typeof ev.subtituloBoasVindas === 'string' ? ev.subtituloBoasVindas : '';
  const textoBotao =
    typeof ev.textoBotao === 'string' && ev.textoBotao.trim() !== ''
      ? ev.textoBotao
      : 'Gere sua foto personalizada';
  const logo = typeof ev.logo === 'string' && ev.logo.trim() !== '' ? ev.logo : '/logos/default.svg';

  if (!Array.isArray(ev.perguntas) || ev.perguntas.length === 0) {
    falhar(`${onde} precisa de pelo menos uma pergunta em "perguntas".`);
  }

  const perguntas = ev.perguntas.map((p, i) => {
    const ondeP = `${onde}, pergunta ${i + 1}`;
    if (typeof p !== 'object' || p === null || Array.isArray(p)) {
      falhar(`${ondeP} está com um formato inesperado — confira a identação.`);
    }
    const pergunta = textoObrigatorio(p.pergunta, `${ondeP}: "pergunta"`);
    const id = typeof p.id === 'string' && p.id.trim() !== '' ? p.id : `p${i + 1}`;

    if (!Array.isArray(p.opcoes) || p.opcoes.length < 2) {
      falhar(`${ondeP} ("${pergunta}") precisa de pelo menos duas opções em "opcoes".`);
    }

    const opcoes = p.opcoes.map((o, j) => {
      const ondeO = `${ondeP}, opção ${j + 1}`;
      if (typeof o !== 'object' || o === null || Array.isArray(o)) {
        falhar(`${ondeO} está com um formato inesperado — confira a identação.`);
      }
      const texto = textoObrigatorio(o.texto, `${ondeO}: "texto"`);
      const oid = typeof o.id === 'string' && o.id.trim() !== '' ? o.id : `o${j + 1}`;
      const emoji = typeof o.emoji === 'string' ? o.emoji : '';
      return { id: oid, label: texto, emoji };
    });

    return { id, prompt: pergunta, options: opcoes };
  });

  eventos[slug] = {
    slug,
    eventName: nomeDoEvento,
    welcomeTitle: tituloBoasVindas,
    welcomeSubtitle: subtituloBoasVindas,
    ctaLabel: textoBotao,
    logo,
    questions: perguntas
  };
}

const banner = `// Gerado automaticamente a partir de eventos.yaml — não edite à mão.
// Para mudar um evento, edite eventos.yaml e rode \`npm run dev\` ou
// \`npm run build\` de novo (isso acontece sozinho).
`;

const body = `${banner}
import type { EventConfig } from './events';

export const events: Record<string, EventConfig> = ${JSON.stringify(eventos, null, 2)};
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, body, 'utf8');
console.log(`✔ eventos.yaml lido com sucesso: ${slugs.length} evento(s) (${slugs.join(', ')}).`);
