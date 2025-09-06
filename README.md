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

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes shadcn/ui
│   ├── common/          # Layout e navegação
│   ├── students/        # Componentes de alunos
│   └── attendance/      # Componentes de chamada
├── pages/               # Páginas da aplicação
├── hooks/               # Custom hooks para React Query
├── services/            # Serviços do Firebase
├── types/               # Tipos TypeScript
├── lib/                 # Utilitários e configurações
└── App.tsx             # Componente raiz
```

## 🗄 Estrutura do Banco de Dados

### Coleção `students`
```typescript
{
  id: string;
  name: string;
  birthdate: string;        // ISO date
  belt: string;             // Faixa/graduação
  registrationDate: string; // ISO date
}
```

### Coleção `attendance`
```typescript
{
  id: string;
  date: string;            // YYYY-MM-DD
  students: [
    {
      id: string;
      name: string;
      isPresent: boolean;
    }
  ];
  notes?: string;          // Observações opcionais
  createdAt: string;       // ISO timestamp
}
```

## 🚦 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o Firestore Database
3. Configure as regras de segurança:

**Desenvolvimento:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Produção (futuro):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Copie as credenciais e atualize `src/lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-project-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

### 3. Executar em desenvolvimento
```bash
npm run dev
```

### 4. Build para produção
```bash
npm run build
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
- [ ] **Relatórios avançados** (frequência por aluno, estatísticas)
- [ ] **Exportação** de dados (PDF, Excel)
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