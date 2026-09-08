# Testes de API com FastAPI e pytest

Exercício solicitado por Karen após o estudo do
[tutorial oficial de testes do FastAPI](https://fastapi.tiangolo.com/tutorial/testing/).
Implementação e execução assistidas pelo Codex. Próximo passo: Karen executar,
explicar e modificar os testes.

## Executar

Na raiz do repositório, com Python 3.12:

```bash
python -m venv .venv
```

Ative no Windows PowerShell com `.venv\Scripts\Activate.ps1`,
ou no Linux/macOS com `source .venv/bin/activate`. Depois:

```bash
python -m pip install -r requirements-test.txt
python -m pytest -v
```

Não é necessário iniciar Docker, PostgreSQL ou uvicorn.

## Cenários

| Teste | Requisição | Verificação |
| --- | --- | --- |
| Sucesso | POST /products/ e GET /products/{id} | HTTP 200, ID gerado, campos corretos e persistência |
| Dados inválidos | POST /products/ com value não numérico | HTTP 422, erro no campo value e nenhum produto criado |
| Recurso inexistente | GET /products/999999 em banco vazio | HTTP 404 e mensagem Product not found |

A criação retorna 200 no contrato atual; o teste respeita esse comportamento.
A comparação de preço usa Decimal para verificar o valor monetário.

`TestClient` envia requisições à aplicação em memória. `pytest` descobre funções
iniciadas por `test_`. Cada `assert` descreve uma condição esperada. As fixtures
em `tests/conftest.py` preparam e encerram o ambiente automaticamente.

## Isolamento e limites

Antes de importar `app.main`, a fixture de sessão direciona DATABASE_URL para um
arquivo SQLite temporário, pois a aplicação cria tabelas durante a importação.
Cada teste recebe outro banco SQLite vazio em memória através de
`app.dependency_overrides[get_db]`. StaticPool compartilha esse banco entre as
threads do cliente. Sessões são fechadas, overrides restaurados e engines
liberados ao terminar. Nenhum .env precisa ser editado.

`pytest.ini` limita a descoberta a `tests/`. O arquivo existente `app/test_db.py`
é um diagnóstico de conexão, não parte desta suíte isolada.

Estes cenários não cobrem todas as regras do sistema nem validam comportamentos
específicos do PostgreSQL, concorrência ou uma implantação real.

## Resultado

Execução local pelo Codex em 08/09/2026:

- Python 3.12.13; pytest 9.1.1; FastAPI 0.141.1; HTTPX 0.28.1.
- Comando: `python -m pytest -v`.
- Resultado: **3 passed, 4 warnings**; código de saída 0.
- Avisos de depreciação em Starlette/AnyIO e configurações antigas de Pydantic
  em dois schemas existentes. Não houve falha dos testes.
- Registro de execução local, não de GitHub Actions.

## Sua próxima prática

1. Execute e identifique os três testes no terminal.
2. Explique por que o segundo retorna 422 e o terceiro 404.
3. Troque o preço válido, atualize a expectativa e execute novamente.
4. Como próximo exercício, teste a ausência do campo obrigatório name.

Este trabalho assistido não equivale a uma certificação nem comprova, sozinho,
domínio independente da ferramenta.
