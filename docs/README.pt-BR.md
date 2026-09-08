# 📦 StockMaster - Production & Inventory Management

Sistema industrial para controle de estoque de insumos e gestão inteligente de produção, desenvolvido para o desafio técnico **Autoflex**.

## 🚀 Sobre o Projeto

O StockMaster otimiza o planejamento fabril ao cruzar dados de estoque em tempo real com receitas de produtos (BOM). O sistema prioriza automaticamente a produção de itens com maior valor agregado, garantindo a melhor rentabilidade para a indústria.

## 🛠️ Stack Tecnológica

* **Backend:** Python com **FastAPI** (Async, Pydantic).
* **Frontend:** **React.js** com **Tailwind CSS** (Interface responsiva).
* **Banco de Dados:** **PostgreSQL** (Persistência robusta via SQLAlchemy).
* **Infraestrutura:** **Docker & Docker Compose** (Ambiente isolado e replicável).

## 📋 Como Executar (Docker)

1. **Clone o repositório:**
```bash
git clone https://github.com/KarenAngelis/production-stock-api.git

```

2. **Configure as variáveis de ambiente (.env):**
```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5433git/production_stock
STRICT_DB=1

```


3. **Suba os containers:**
```bash
docker-compose up --build

```

* **Frontend:** `http://localhost:3000`
* **API/Swagger:** `http://localhost:8000/docs`



## 🧠 Atendimento aos Requisitos

### Gestão de Dados (CRUDs)

* **Produtos (RF001/RF005):** Cadastro com código, nome e valor unitário.
* **Matérias-Primas (RF002/RF006):** Gestão de insumos e níveis de estoque.
* **Receitas/BOM (RF003/RF007):** Associação `Product Raw Materials` definindo quantidades necessárias por unidade produzida.

### Inteligência de Negócio

* **Sugestão de Produção (RF004/RF008):** Algoritmo que identifica o limite de produção baseado no "gargalo" do estoque atual.
* **Priorização por Valor:** A lógica de sugestão ordena automaticamente os produtos do maior para o menor preço.
* **Cálculo de Receita Potencial:** Dashboard exibe o valor total estimado da produção sugerida.

### Qualidade e Padrões

* **Internacionalização (RNF007):** Todo o código, rotas e banco de dados em **Inglês**.
* **Movimentações (Extra):** Histórico de entradas e saídas para auditoria de inventário.

## 📐 Estrutura de Pastas

```text
├── app/                # Backend (FastAPI)
│   ├── models/         # SQLAlchemy Models
│   ├── routers/        # API Endpoints
│   └── schemas/        # Pydantic Schemas
├── frontend/           # React Frontend
│   ├── src/pages/      # Dashboard, Products, Insumos, Receitas
│   └── src/services/   # Camada de integração API
└── docker-compose.yml  # Orquestração de serviços

```

