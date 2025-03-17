# Affiliates Dashboard

Dashboard para parceiros do site de reclamações de voos.

## Funcionalidades

- Cadastro de parceiros
- Dashboard com métricas de desempenho
- Visualização de casos e seus status
- Geração de links e QR codes personalizados
- Filtros por data

## Requisitos

- Node.js 18+
- MongoDB
- npm ou yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm run install-all
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:
   ```
   MONGODB_URI=sua_url_mongodb
   JWT_SECRET=seu_segredo_jwt
   PORT=5000
   ```

4. Inicie o projeto:
```bash
npm start
```

O frontend estará disponível em `http://localhost:3000` e o backend em `http://localhost:5000`.

## Estrutura do Projeto

- `/frontend`: Aplicação React com TypeScript
- `/backend`: API Node.js com Express e TypeScript 