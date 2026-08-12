# Arquitetura do StockMaster

```mermaid
flowchart LR
    U[Usuário] --> F[React + Tailwind CSS]
    F -->|API REST| A[FastAPI]
    A --> P[Produtos e receitas BOM]
    A --> S[Estoque e movimentações]
    A --> R[Planejamento de produção]
    P --> DB[(PostgreSQL)]
    S --> DB
    R --> DB
    D[Docker Compose] -. orquestra .-> F
    D -. orquestra .-> A
    D -. orquestra .-> DB
```

## Responsabilidades

- O frontend oferece dashboard, cadastros e fluxos de movimentação.
- A API separa endpoints, schemas e modelos de persistência.
- A regra de planejamento cruza receitas de fabricação com o estoque disponível.
- O PostgreSQL mantém produtos, matérias-primas, receitas e movimentações.
- O Docker Compose reproduz a aplicação e suas dependências localmente.

