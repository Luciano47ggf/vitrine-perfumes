# Rafael · Perfumaria masculina

Catálogo de perfumes de alto padrão com pedidos pelo WhatsApp e um painel simples para cadastrar perfumes.

**Tecnologia:** Next.js 15 · TypeScript · Tailwind CSS 4 · Supabase (banco, login e fotos) · Vercel (hospedagem).

---

## Funcionalidades

**Vitrine (pública)**
- Cabeçalho com o nome da loja e o Instagram.
- Promoções em destaque, trocando sozinhas com transição suave (pausa ao passar o mouse).
- Catálogo com foto, marca, nome e status Disponível/Indisponível.
- Busca instantânea por nome ou marca.
- Janela de detalhes: foto ampliada, volume, preço, **acordes principais** (barras coloridas por intensidade) e descrição.
- **Chamar no WhatsApp** com a mensagem pronta, já com o nome do perfume.
- Perfume indisponível → botão **Encomendar pelo WhatsApp**.
- Busca sem resultado → botão para encomendar o perfume digitado.
- Cada perfume tem link próprio (ex.: `site.com/#dior-sauvage-elixir`) e botão **Compartilhar este perfume**; o “voltar” do celular fecha o perfume sem sair do site.
- Link do site no WhatsApp/Instagram mostra uma imagem de capa com o nome da loja.

**Painel (`/admin`, com login e senha)**
- Lista de perfumes com busca e contadores.
- Cadastrar, editar e excluir (com confirmação).
- Liga/desliga **Disponível** e **Promoção** direto na lista.
- Foto reduzida automaticamente antes do envio (máx. 1600 px, WebP); a foto antiga só é apagada depois que o cadastro é salvo.
- Aviso antes de fechar o cadastro com alterações não salvas; preço formatado automaticamente.
- Acordes: toque para escolher (até 10, entre 26) e arraste para ajustar a intensidade.
- ⚙ Configurações: nome da loja, frase curta, WhatsApp (com botão “Testar número”) e Instagram (aceita @ ou o link do perfil).

**Desempenho e segurança**
- Vitrine em cache: abre instantaneamente e atualiza na hora quando algo é salvo no painel.
- Fotos servidas no tamanho certo para cada tela (AVIF/WebP); fontes incluídas no projeto.
- Banco protegido por RLS: visitantes só leem; apenas administradores alteram.

**Apresentação para clientes:** `demo/apresentacao.html` é uma demonstração com tour guiado e perfumes de exemplo. Funciona sozinha (abra no navegador ou publique no Netlify Drop).

---

## Colocar no ar (cerca de 15 minutos)

### 1. Supabase (banco de dados)
1. Crie uma conta e um projeto em [supabase.com](https://supabase.com) (plano gratuito serve). Região sugerida: **South America (São Paulo)**.
2. Menu **SQL Editor** → **New query** → cole todo o arquivo `supabase/migrations/0001_init.sql` → **Run**.
3. Nova query → cole `supabase/migrations/0002_acordes.sql` → **Run**.
4. Menu **Authentication → Users → Add user → Create new user**: e-mail e senha do Rafael, marque **Auto Confirm User**.
5. Torne esse usuário administrador (SQL Editor):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-do-rafael@exemplo.com';
   ```
6. **Authentication → Sign In / Providers** → desligue **Allow new users to sign up** (ninguém mais cria conta).
7. **Project Settings → API Keys**: copie a **Project URL** e a **Publishable key** (`sb_publishable_...`).
   > ⚠️ **Nunca** use a **Secret key** (`sb_secret_...`) nem a `service_role`. Elas dão acesso total ao banco. O site recusa essas chaves, mas, se uma delas for colada por engano, apague-a no Supabase e gere outra.

### 2. Vercel (hospedagem)
1. Entre em [vercel.com](https://vercel.com) com a conta do GitHub.
2. **Add New → Project** → importe este repositório (o Next.js é detectado sozinho).
3. Em **Environment Variables**, adicione:

   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) |

4. **Deploy**. Em cerca de 1 minuto o site estará em `https://seu-projeto.vercel.app`.

### 3. Primeiro acesso
1. Abra `https://seu-projeto.vercel.app/admin` e entre com o e-mail e a senha criados.
2. Clique em **⚙ Configurações** e preencha o WhatsApp (com DDD) e o Instagram.
3. Clique em **+ Novo perfume** e cadastre o catálogo.

> Domínio próprio (ex.: `rafaelperfumaria.com.br`): na Vercel, **Settings → Domains**.

---

## Rodar no computador (opcional)
```bash
cp .env.example .env.local   # cole a URL e a Publishable key
npm install
npm run dev                  # http://localhost:3000  e  /admin
```

## Estrutura
```
supabase/migrations/        banco: tabelas, segurança (RLS) e armazenamento de fotos
src/app/page.tsx            vitrine (página em cache)
src/app/admin/              login, painel e saída
src/app/api/revalidate/     atualiza a vitrine quando o painel salva
src/components/storefront/  catálogo, promoções, detalhes, acordes, WhatsApp
src/components/admin/       painel, cadastro, acordes, configurações
src/lib/                    preços em centavos, acordes, WhatsApp, fotos
demo/apresentacao.html      apresentação para clientes
```

## Dicas de foto
Fotos verticais (4:5), com fundo claro e liso, ficam mais bonitas. Pode usar a foto direto do celular: o painel reduz o tamanho sozinho.
