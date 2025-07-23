# Lumio – Iluminando cada passo da sua viagem

Este repositório contém o projeto **Lumio**, um app de roteiros personalizados que usa Inteligência Artificial e a API do Google para montar passeios sob medida. Com base nas suas preferências de estilo de viagem, orçamento e interesses específicos, o app cria uma timeline interativa com mapas, horários e sugestões inteligentes. Viaje com praticidade, inteligência e do seu jeito.

---

## Estrutura do Projeto

```
/
├── back-end          # Servidor NestJS + workers
├── Front-end         # Aplicativo React Native (Expo)
├── docker-compose.yml
├── docker-compose.override.yml
└── README.md         # (este arquivo)
```

## Pré‑requisitos

- **Node.js** ≥ 18.x (recomendado 20.x LTS)

- **npm** (vem com o Node.js) ou **yarn**

- **Docker** & **Docker Compose**

- **Expo CLI** (opcional, global):

  ```bash
  npm install -g expo-cli
  ```

- **EAS CLI** (opcional, global, para builds de produção):

  ```bash
  npm install -g eas-cli
  ```

## Configuração

### Back‑end

1. Acesse a pasta `back-end`:

   ```bash
   cd back-end
   ```

2. Crie (ou edite) o arquivo `.env` em `config/.env` com as variáveis abaixo:

   ```env
   SUPABASE_URL=<sua_url_supabase>
   SUPABASE_KEY=<sua_chave_anon_supabase>
   GOOGLE_PLACES_API_KEY=<sua_chave_google_places>
   RABBITMQ_URL=<url_do_rabbitmq>
   ```

3. Instale dependências:

   ```bash
   npm install
   ```

### Front‑end

1. Acesse a pasta `Front-end`:

   ```bash
   cd Front-end
   ```

2. Abra `config/config.ts` e defina:

   ```ts
   export const API_URL = "http://localhost:3000";
   export const GOOGLE_PLACES_API_KEY = "<sua_chave_google_places>";
   ```

3. Instale dependências:

   ```bash
   npm install
   ```

## Executando em Desenvolvimento

### Opção 1: Usando Docker Compose

No diretório raiz do projeto, execute:

```bash
docker-compose up --build
```

Isso iniciará:

- **RabbitMQ** (portas 5672 e 15672)
- **API NestJS** ([http://localhost:3000](http://localhost:3000))
- **Worker de processamento**

### Opção 2: Manual (sem Docker)

#### 1. Backend

```bash
cd back-end
npm run start:dev       # servidor com live‑reload em http://localhost:3000
```

#### 2. Worker

```bash
cd back-end
npx ts-node src/workers/worker-save.ts
```

#### 3. Frontend

```bash
cd Front-end
expo start             # inicia Metro Bundler
```

Use `npm run android`, `npm run ios` ou `npm run web` para abrir no emulador/dispositivo.

## Build para Produção

### Backend

```bash
cd back-end
npm run build
npm run start:prod     # executa código compilado em dist/
```

Ou usando Docker:

```bash
docker-compose -f docker-compose.yml up --build
```

### Frontend

Requer conta Expo e EAS CLI:

```bash
cd Front-end
eas build --platform android
eas build --platform ios
```

## Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).
