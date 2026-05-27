# PlannerEdu — Painel Web

SPA em Svelte 4 com Tailwind CSS e Vite. Interface web para alunos, professores, coordenadores e administradores.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js    | 18+           |
| npm        | 9+            |

---

## Configuração

O painel web se comunica diretamente com o backend em `http://localhost:3000`. Certifique-se de que o backend está rodando antes de abrir o painel.

> Para mudar a URL da API, edite `src/lib/api.js` e altere a constante `BASE`.

---

## Rodando o projeto

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (hot reload)
npm run dev
```

O painel estará disponível em `http://localhost:5173`.

### Outros comandos

```bash
# Gerar build de produção (pasta dist/)
npm run build

# Pré-visualizar o build de produção localmente
npm run preview
```

---

## Estrutura de pastas

```
src/
  components/   → componentes reutilizáveis (layout, UI)
  config/       → definição de rotas por role (routes.js)
  layouts/      → AppLayout, AuthLayout
  lib/          → cliente HTTP (api.js)
  pages/
    global/     → Login, Cadastro, OTP, etc.
    student/    → Dashboard, Kanban, Calendário, etc.
    teacher/    → Turmas, progresso de alunos
    coordinator/→ Matrículas, turmas, professores, disciplinas
    admin/      → Instituições, usuários
  stores/       → stores Svelte globais
```

---

## Roles e painéis

| Role          | URL base    | Funcionalidades principais                    |
|---------------|-------------|-----------------------------------------------|
| `student`     | `/s/`       | Kanban, calendário, matérias, IA, ranking      |
| `teacher`     | `/t/`       | Turmas, progresso de alunos, criar tarefas    |
| `coordinator` | `/c/`       | Matrículas, turmas, professores, disciplinas  |
| `admin`       | `/a/`       | Gerenciar instituições e usuários             |

O roteamento é automático: após o login, o usuário é redirecionado para o painel correto conforme seu role.
