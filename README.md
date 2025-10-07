# Sistema de Gerenciamento de Alunos e Chamada

Um sistema completo para gerenciamento de alunos e registro de chamadas, desenvolvido com React + TypeScript e Firebase Firestore.

## 🚀 Funcionalidades

### Gestão de Alunos
- ✅ **CRUD completo**: Criar, visualizar, editar e excluir alunos
- ✅ **Informações completas**: Nome, data de nascimento, faixa (graduação) e data de matrícula
- ✅ **Busca e filtros**: Pesquisar alunos por nome ou faixa
- ✅ **Cards organizados**: Visualização limpa e intuitiva dos dados

### Sistema de Chamada
- ✅ **Chamada tradicional**: Lista completa com checkboxes para marcar presença
- ✅ **Chamada interativa**: Processo guiado aluno por aluno
- ✅ **Observações**: Adicionar notas específicas sobre a aula
- ✅ **Resumo em tempo real**: Contador de presentes/ausentes

### Histórico e Relatórios
- ✅ **Histórico completo**: Todas as chamadas registradas
- ✅ **Filtros por data**: Buscar chamadas em períodos específicos
- ✅ **Taxa de presença**: Cálculo automático de percentual de frequência
- ✅ **Detalhamento**: Ver quem estava presente/ausente em cada aula

## 🛠 Stack Tecnológica

### Frontend
- **React 18** com TypeScript
- **React Router DOM** para navegação
- **TailwindCSS** + **shadcn/ui** para UI/UX
- **React Query** para gerenciamento de estado e cache
- **React Hook Form** + **Zod** para formulários validados
- **Sonner** para notificações toast

### Backend
- **Firebase Firestore** (banco NoSQL em tempo real)
- **Firebase Auth** (autenticação - implementação futura)
- **Regras de segurança** configuráveis por ambiente


### 1. Instalar dependências
```bash
npm install
```

### 2. Executar em desenvolvimento
```bash
npm run dev
```


## 📱 Páginas da Aplicação

### `/login`
- **Funcionalidade**: Tela de autenticação (placeholder para Firebase Auth)
- **Status**: Atualmente redireciona direto para a página principal

### `/students`
- **Funcionalidade**: Lista e gerencia todos os alunos
- **Features**: Busca, criação, edição, exclusão

### `/attendance`
- **Funcionalidade**: Registro de chamada tradicional
- **Features**: Lista com checkboxes, observações, resumo

### `/interactive-attendance`
- **Funcionalidade**: Chamada interativa aluno por aluno
- **Features**: Interface guiada, progresso visual, confirmações

### `/history`
- **Funcionalidade**: Histórico de todas as chamadas
- **Features**: Filtros por data, detalhamento, estatísticas

### `/register`
- **Funcionalidade**: Cadastro de novos alunos
- **Features**: Formulário validado, faixas predefinidas

## 🔮 Próximas Implementações

- [ ] **Firebase Authentication** completo (Google, Email/Senha)
- [ ] **Notificações** para alunos faltosos
- [ ] **Dashboard** com gráficos e métricas
- [ ] **Modo offline** com sincronização automática
- [ ] **Multi-tenancy** para diferentes academias

## 📊 Recursos de Desenvolvimento

- **React Query DevTools**: Monitore cache e requisições
- **TypeScript**: Tipagem forte em todo o projeto
- **ESLint**: Análise de código e boas práticas
- **Tailwind + shadcn/ui**: Design system consistente
- **Hot Reload**: Desenvolvimento ágil com Vite

## 🔒 Segurança

- **Validação no frontend**: Formulários com Zod + React Hook Form
- **Regras Firestore**: Controle de acesso no banco
- **Sanitização**: Dados limpos antes de persistir
- **Auth futura**: Firebase Auth com tokens JWT

O sistema está pronto para uso em desenvolvimento e pode ser facilmente migrado para produção com a configuração adequada do Firebase!
