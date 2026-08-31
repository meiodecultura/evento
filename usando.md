# Como usar o app — guia para quem administra

Este guia é para quem vai cuidar do app no dia a dia: criar e editar
eventos, e consultar as respostas das pessoas depois. Não é preciso saber
programar para nada disso — só seguir os passos.

> Se você nunca usou o GitHub, vale abrir uma conta em [github.com](https://github.com)
> e pedir pra quem configurou o projeto te dar acesso ao repositório (o
> "projeto" no GitHub).

---

## 1. Editando perguntas, textos e eventos

Tudo isso fica em **um único arquivo**: `eventos.yaml`, na raiz do projeto.

### 1.1. Abrindo o arquivo para editar

1. Entre no repositório do projeto em github.com.
2. Clique no arquivo **`eventos.yaml`** na lista de arquivos.
3. Clique no ícone de lápis (✏️), no canto superior direito do arquivo, para
   editar direto pelo navegador.

### 1.2. Entendendo o arquivo

Cada evento é um bloco assim:

```yaml
demo:
  nomeDoEvento: "Meio Day"
  tituloBoasVindas: "Olá, bem-vindo(a) ao Meio Day"
  subtituloBoasVindas: "Vamos criar a sua foto personalizada do evento."
  textoBotao: "Gere sua foto personalizada"
  logo: "/logos/default.svg"
  perguntas:
    - pergunta: "Antes de tirar a foto, responda pra gente: como você está se sentindo hoje?"
      opcoes:
        - texto: "Animado(a)"
          emoji: "🤩"
        - texto: "Feliz"
          emoji: "😄"
```

O que cada campo faz:

| Campo | Para que serve | Obrigatório? |
|---|---|---|
| `demo:` (o nome antes dos dois-pontos) | Vira o endereço do link do evento, tipo `seusite.com/demo/`. Só letras minúsculas, números e hífen, sem espaço nem acento. | Sim |
| `nomeDoEvento` | Nome do evento (aparece no título da aba do navegador e no nome do arquivo quando a foto é baixada). | Sim |
| `tituloBoasVindas` | Frase grande na tela inicial. | Sim |
| `subtituloBoasVindas` | Frase menor, embaixo do título. | Não |
| `textoBotao` | Texto do botão que começa o fluxo. | Não (padrão: "Gere sua foto personalizada") |
| `logo` | Caminho da imagem da logo (veja seção 1.4). | Não (padrão: a logo de exemplo) |
| `perguntas` | Lista de perguntas — pode ter uma ou várias, elas aparecem em sequência. | Sim, pelo menos uma |
| `pergunta` (dentro de cada item de `perguntas`) | O texto da pergunta. | Sim |
| `opcoes` | As alternativas de resposta. | Sim, pelo menos duas |
| `texto` (dentro de cada item de `opcoes`) | O texto do botão da opção. | Sim |
| `emoji` | Emoji mostrado em cima do texto da opção. | Não |

### 1.3. Regras importantes de formatação

- **Identação com espaços, nunca Tab.** Cada nível fica 2 espaços mais à
  direita que o de cima. Se você copiar e colar um bloco inteiro (pra criar
  um evento novo, por exemplo), os espaços já vêm certos — não precisa
  ajustar nada, só trocar os textos.
- **Sempre use aspas duplas** em volta dos textos: `"assim"`. Principalmente
  se o texto tiver dois-pontos, aspas ou emoji dentro.
- Pra editar o **emoji**, é só copiar e colar o emoji desejado de algum
  lugar (ex: [emojipedia.org](https://emojipedia.org)) ou usar o seletor de
  emoji do seu computador (no Mac: `Control + Command + Espaço`; no
  Windows: `Tecla Windows + .`).

### 1.4. Adicionando uma logo nova

1. No repositório, entre na pasta `static/logos/`.
2. Clique em **Add file → Upload files** e envie a imagem (PNG ou SVG —
   PNG com fundo transparente funciona melhor).
3. No `eventos.yaml`, no campo `logo` do evento, escreva
   `/logos/nome-do-arquivo.png` (o nome exato do arquivo que você acabou de
   enviar).

A logo aparece sobreposta no canto inferior direito da foto.

### 1.5. Criando um evento novo

1. Dentro de `eventos.yaml`, selecione um bloco de evento inteiro (do nome
   do evento até a última linha da última opção da última pergunta) e
   copie.
2. Cole no final do arquivo.
3. Troque o nome do evento (o texto antes dos dois-pontos) por um novo,
   único — por exemplo `festa-junina`.
4. Ajuste os textos e as perguntas.
5. Salve (veja o próximo passo).

### 1.6. Salvando e publicando

Depois de editar, role até o final da página e clique em **Commit
changes...** (ou **Propose changes**, se você não tiver permissão direta de
editar — nesse caso alguém com acesso vai precisar aprovar). Em alguns
minutos o site atualiza sozinho.

**Como saber se deu certo:** clique na aba **Actions** do repositório no
GitHub. Deve aparecer uma execução com um ✅ verde. Se aparecer um ❌
vermelho, alguma coisa no `eventos.yaml` está com o formato errado —
normalmente é identação (espaços) ou uma aspa esquecida. Clique na execução
com erro, depois em "build", e procure uma linha que começa com `❌ Erro em
eventos.yaml:` — ela explica exatamente o que corrigir.

---

## 2. Acessando as respostas no Supabase

Se o app estiver configurado pra salvar respostas (veja o `README.md`,
seção "Salvando respostas"), cada pessoa que completa o questionário gera
uma linha numa tabela — **sem nome, e-mail ou qualquer coisa que
identifique quem respondeu, e nunca com a foto.**

### 2.1. Olhando as respostas na tela

1. Entre em [supabase.com](https://supabase.com) e faça login.
2. Abra o projeto do app.
3. No menu à esquerda, clique em **Table Editor**.
4. Clique na tabela **responses**.

Cada linha é uma pessoa que completou o questionário. As colunas são:

- `id` — um código aleatório, só pra identificar a linha (não identifica a
  pessoa).
- `created_at` — data e hora da resposta.
- `event_slug` — qual evento (bate com o nome usado em `eventos.yaml`).
- `answers` — as respostas, num formato compacto (veja a seção 3 pra
  transformar isso numa tabela normal).

### 2.2. Baixando tudo como CSV (planilha)

No **Table Editor**, com a tabela `responses` aberta, clique no botão de
exportar (ícone perto do canto superior direito da tabela, geralmente
"Export to CSV" ou os três pontinhos `⋯` → **Export data as CSV**). Isso
baixa um arquivo `.csv` que abre no Excel, Google Sheets ou Numbers.

Só que a coluna `answers` vem com o JSON inteiro dentro de uma célula só,
tipo `{"p1":"Feliz","p2":"Biologia"}` — a seção 3 explica como separar isso
em uma coluna por pergunta.

---

## 3. Transformando a coluna `answers` numa tabela normal

Tem duas formas de fazer isso — escolha a que for mais confortável.

### Opção A — Direto no Supabase, com SQL (mais simples, sem instalar nada)

1. No Supabase, clique em **SQL Editor** no menu à esquerda.
2. Clique em **New query**.
3. Cole e rode:

   ```sql
   select
     r.id as resposta_id,
     r.created_at,
     r.event_slug,
     kv.key as pergunta_id,
     kv.value as resposta
   from public.responses r,
        jsonb_each_text(r.answers) as kv(key, value)
   order by r.created_at, r.id, kv.key;
   ```

4. O resultado aparece embaixo, com **uma linha por pergunta respondida**
   (se uma pessoa respondeu 2 perguntas, ela vira 2 linhas aqui — uma pra
   cada pergunta, coluna `pergunta_id` diz qual). Esse formato "comprido" é
   ótimo pra montar tabelas dinâmicas (pivot table) no Excel/Sheets depois.
5. Pra baixar: no canto do resultado tem um botão de exportar/baixar CSV.

> Prefere um formato "largo" (uma coluna por pergunta, uma linha por
> pessoa) direto no SQL? Isso exige agregação condicional porque cada
> evento pode ter perguntas diferentes — mais simples é usar a Opção B
> abaixo, que já faz isso automaticamente a partir do CSV.

### Opção B — Script incluído no projeto (formato "largo": uma coluna por pergunta)

Isso pega o CSV que você baixou na seção 2.2 (com a coluna `answers` cheia
de JSON) e gera outro CSV com uma coluna por pergunta.

**Pré-requisito:** ter o [Node.js](https://nodejs.org) instalado (só uma
vez) e o projeto instalado localmente (`npm install`, dentro da pasta do
projeto — quem configurou o app originalmente pode te ajudar com isso).

1. Baixe o CSV do Supabase (seção 2.2) e salve, por exemplo, como
   `respostas.csv` dentro da pasta do projeto.
2. Abra o terminal na pasta do projeto e rode:

   ```sh
   node scripts/achatar-respostas.mjs respostas.csv
   ```

3. Isso cria `respostas-achatado.csv`, já com uma coluna por pergunta (por
   exemplo `p1`, `p2`) e uma linha por pessoa — pronto pra abrir no Excel
   ou Google Sheets.

Exemplo do resultado:

| id | data | evento | p1 | p2 |
|---|---|---|---|---|
| a1b2 | 2026-08-30T10:00 | tresminutos | Feliz | Biologia |
| a1b3 | 2026-08-30T10:05 | tresminutos | Animado(a) | Engenharia de Produção |
| a1b4 | 2026-08-30T10:10 | demo | Tranquilo(a) | |

> As colunas `p1`, `p2`... correspondem à ordem das perguntas no
> `eventos.yaml` de cada evento (a primeira pergunta é `p1`, a segunda
> `p2`, e assim por diante).

---

## 4. Perguntas frequentes

**Preciso rodar algum comando depois de editar o `eventos.yaml`?**
Não, se você editou direto pelo site do GitHub — o "Commit changes" já
dispara a publicação automática. O comando `node scripts/...` só é
necessário pra achatar um CSV de respostas (seção 3, Opção B).

**Errei alguma coisa no `eventos.yaml` e o site não atualizou.**
Veja a seção 1.6 — confira a aba **Actions** no GitHub pra ver a mensagem
de erro exata. O site publicado anteriormente continua no ar normalmente
até o erro ser corrigido — nada quebra pros visitantes.

**Dá pra editar mais de um evento por vez?**
Dá sim — é só ter vários blocos no mesmo `eventos.yaml`, um por evento
(veja o arquivo atual como exemplo, ele já tem mais de um).

**As respostas salvas identificam quem respondeu?**
Não. Não é pedido nome, e-mail ou qualquer identificação — só a resposta
em si, e nunca a foto (a foto nunca sai do navegador da pessoa, nem chega a
ser enviada pra lugar nenhum).
