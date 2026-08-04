# TODO - Auditoria e Correções

## Fase 1 - Correção de Bugs Críticos ✅
- [x] 1. Corrigir Pydantic v2: `.dict()` → `.model_dump()` em `reviews.py`
- [x] 2. Adicionar `payment_message` e `payment_approved` ao `OrderDetailResponse`
- [x] 3. Refatorar `change_password` para AuthService
- [x] 4. Refatorar `order_service.py` para compatibilidade com schemas

## Fase 2 - Correção de Testes ✅
- [x] 5. Reescrever `test_api.py` para usar fixture `client` do `conftest.py`
- [x] 6. Adicionar testes para edge cases (duplicate email, wishlist, review, insufficient stock, categories)

## Fase 3 - Validação ✅
- [x] 7. Rodar testes e corrigir falhas
- [x] 8. Verificar compilação sem erros

