# Meio de Cultura — foto personalizada

App simples, 100% client-side (sem backend), para gerar fotos personalizadas
em eventos: o visitante responde uma pergunta rápida, tira uma foto pela
câmera do computador ou do celular, e sai com a imagem com a logo do evento
sobreposta — pronta para baixar ou compartilhar.

**A foto nunca é armazenada.** Ela é gerada e processada só no navegador da
pessoa e some assim que ela sai da página — nunca é enviada a lugar nenhum.
As respostas às perguntas podem, opcionalmente, ser salvas de forma anônima
(veja "Salvando respostas" abaixo) — sem nome, e-mail ou qualquer dado que
identifique quem respondeu.

> **Vai administrar o app no dia a dia (criar eventos, ver respostas) e não
> mexe com código?** Este README é a referência técnica — o guia pensado
> pra você, sem programação, é o **[usando.md](usando.md)**.

## Rodando localmente

```sh
npm install
npm run dev
```

Acesse `http://localhost:5173/demo/` (o evento de demonstração já vem
configurado).

> A câmera só funciona em `localhost` ou HTTPS — isso é uma exigência do
> navegador, não do app.

## Estrutura de URL por evento

Cada evento tem seu próprio link:

```
[seu-site]/[slug-do-evento]/
```

Ex.: `https://usuario.github.io/meioapp/festa-junina/`

## Criando um evento novo

Os eventos ficam em [eventos.yaml](eventos.yaml), na raiz do projeto — um
arquivo de texto simples, pensado para ser editado por quem não programa
(inclusive direto pelo site do GitHub, sem instalar nada). O guia completo
em português, passo a passo com capturas de tela mentais de cada clique,
está em **[usando.md](usando.md)** — é o material pra passar pra quem vai
cuidar do dia a dia do app.

Resumo rápido: cada evento é um bloco tipo

```yaml
festa-junina:
  nomeDoEvento: "Festa Junina 2026"
  tituloBoasVindas: "Olá, bem-vindo(a) à Festa Junina!"
  subtituloBoasVindas: "Vamos criar a sua foto personalizada."
  textoBotao: "Gere sua foto personalizada"
  logo: "/logos/festa-junina.svg"
  perguntas:
    - pergunta: "Como você está se sentindo hoje?"
      opcoes:
        - texto: "Feliz"
          emoji: "😄"
        - texto: "Animado(a)"
          emoji: "🤩"
```

O nome antes dos dois-pontos (`festa-junina`) vira a URL do evento. Coloque
a logo (PNG ou SVG, fundo transparente funciona melhor) em `static/logos/`.

Um script (`scripts/build-events.mjs`) lê esse YAML e gera automaticamente
o `src/lib/config/events.generated.ts` que o app de fato usa — ele roda
sozinho antes de `npm run dev`, `npm run build` e `npm run check` (veja os
hooks `predev`/`prebuild`/`precheck` em `package.json`), e se algo no YAML
estiver errado (identação, campo faltando) ele para com uma mensagem em
português dizendo exatamente o que corrigir, antes de qualquer coisa ir
para o site.

## Salvando respostas (opcional, com Supabase)

Por padrão as respostas não vão a lugar nenhum. Se quiser guardá-las (só as
respostas — nunca a foto, nunca nada que identifique a pessoa), dá pra usar
o [Supabase](https://supabase.com) gratuito:

1. Crie um projeto em supabase.com.
2. No **SQL Editor**, rode:

   ```sql
   create table public.responses (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz not null default now(),
     event_slug text not null,
     answers jsonb not null
   );

   alter table public.responses enable row level security;

   create policy "Permitir insert anônimo"
     on public.responses
     for insert
     to anon
     with check (true);
   ```

   Essa política deixa qualquer visitante *inserir* uma resposta, mas
   ninguém consegue *ler* as respostas de volta pela chave pública — só você,
   pelo painel do Supabase ou pelo SQL Editor.

   > **Se a tabela já existia antes de rodar esse SQL** (por exemplo, criada
   > à mão antes desta configuração), o `insert` pode continuar dando `401
   > permission denied` mesmo com a policy criada. RLS é uma camada *em
   > cima* do GRANT padrão do Postgres — ela não concede acesso, só
   > restringe o que já foi concedido. Se acontecer, rode também:
   > ```sql
   > grant insert on public.responses to anon;
   > ```
   > (A publishable key autentica como o role `anon`, então é ele que
   > precisa do grant.) Criar a tabela pelo SQL Editor com o script acima
   > direto num projeto novo normalmente já vem com esse grant — só bata o
   > olho se dar erro de permissão.

3. Em **Settings → API Keys**, copie a **Project URL** e a **Publishable
   key** (começa com `sb_publishable_...`) — ⚠️ nunca use uma **Secret key**
   (`sb_secret_...`) aqui, essa é privada e nunca deve ir para o navegador —
   e cole em [src/lib/config/supabase.ts](src/lib/config/supabase.ts):

   ```ts
   export const supabaseUrl = 'https://SEU-PROJETO.supabase.co';
   export const supabasePublishableKey = 'sb_publishable_...';
   ```

   > A publishable key é a sucessora da antiga "anon key" — mesmos
   > privilégios baixos, mesma lógica de Row Level Security. A única
   > diferença prática é que ela não é um JWT: o app já sabe disso e manda
   > só o header `apikey` na chamada REST (mandar também `Authorization:
   > Bearer` faria o Supabase tentar interpretá-la como JWT e rejeitar a
   > requisição).

4. Reimplante. A partir daí, cada questionário concluído grava uma linha
   com `event_slug` + as respostas em JSON. Se esses dois campos ficarem em
   branco, o app simplesmente não tenta salvar nada — nenhuma chamada de
   rede é feita.

### Como funciona por baixo dos panos

- [src/lib/config/supabase.ts](src/lib/config/supabase.ts) só guarda as duas
  strings (`supabaseUrl` e `supabasePublishableKey`).
- [src/lib/responses.ts](src/lib/responses.ts) exporta `saveResponse(eventSlug, answers)`,
  que faz um `POST` direto pra API REST do Supabase
  (`{supabaseUrl}/rest/v1/responses`) — sem instalar o SDK `@supabase/supabase-js`,
  já que o app só precisa desse único `insert`.
- É chamada em [src/routes/[slug]/+page.svelte](<src/routes/[slug]/+page.svelte>),
  no `oncomplete` do `QuestionStep`, e é "fire-and-forget": a chamada não é
  aguardada (`await`) antes de avançar para a etapa da câmera, e qualquer
  erro (rede fora, Supabase indisponível, tabela não configurada) é
  silenciosamente ignorado — a experiência de tirar a foto nunca trava por
  causa disso.
- **Uma linha por pessoa**, não uma linha por pergunta: `answers` é salvo
  como um único objeto JSON, ex. `{"p1": "Feliz", "p2": "Biologia"}` — as
  chaves são o `id` de cada pergunta (gerado automaticamente como `p1`,
  `p2`... na ordem do YAML, a menos que você defina um `id:` manual), os
  valores são o texto (`texto:`) da opção escolhida.
- Só o header `apikey` é enviado (nunca `Authorization: Bearer`) — ver nota
  acima sobre a publishable key não ser um JWT.

## Deploy no GitHub Pages

1. Crie um repositório no GitHub e suba este projeto.
2. Em **Settings → Pages**, em "Source" escolha **GitHub Actions**.
3. Dê um `git push` na branch `main` — o workflow em
   [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builda e
   publica automaticamente.

O site fica em `https://<usuario>.github.io/<nome-do-repositório>/`. O
caminho base é detectado automaticamente a partir do nome do repositório
(via a variável `BASE_PATH` no workflow) — não precisa editar nada no código
para isso. Se quiser usar um domínio próprio, configure-o normalmente em
**Settings → Pages → Custom domain**; nesse caso pode zerar o `BASE_PATH`
no workflow.

## Decisões de projeto

- **Sem backend próprio.** A foto nunca sai do navegador: captura de câmera,
  composição da imagem com a logo (via `<canvas>`) e compartilhamento (Web
  Share API, com fallback para download) acontecem tudo localmente. O único
  dado que pode viajar para fora é a resposta às perguntas — opcional, via
  Supabase, e sempre anônima (veja "Salvando respostas" acima).
- **Um único componente por etapa** (`WelcomeStep`, `QuestionStep`,
  `CameraStep`, `ResultStep`), orquestrados por uma máquina de estados
  simples em [src/routes/[slug]/+page.svelte](<src/routes/[slug]/+page.svelte>).
  Evita problemas de ciclo de vida da câmera que apareceriam usando rotas
  separadas para cada etapa.
- **SPA estática** (`ssr = false` + fallback `404.html`) porque o app é
  hospedado no GitHub Pages e as URLs de evento são dinâmicas — veja a
  seção "GitHub Pages" da documentação do `adapter-static`.
