# Contributing Guidelines

## Como Contribuir

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Padrões de Código

### Backend (Python)

- Use `black` para formatting
- Use `flake8` para linting
- Type hints em todas as funções
- Docstrings em Google format
- Testes para todas as features

### Frontend (TypeScript)

- Use `eslint` e `prettier`
- Componentes funcionais com hooks
- TypeScript strict mode
- Testes para componentes críticos
- Props bem tipadas

## Commit Message

```
[tipo]: breve descrição

Descrição detalhada se necessário.

Fixes #123
```

Tipos:
- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Documentação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Mudanças build, deps, etc

## Pull Request

- Descrita clara do que muda
- Referencia issue relacionada
- Screenshots se for UI
- Testes passando
- Sem conflitos com main
