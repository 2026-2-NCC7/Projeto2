# 20. Estratégia de Testes

**Versão:** 1.0  
**Responsável:** QA Lead  
**Status:** Draft

---

## 1. Pirâmide de Testes

```
        /\
       /E2E\         Testes End-to-End (10%)
      /------\
     /Integr.\       Testes de Integração (30%)
    /----------\
   /   Unit     \    Testes Unitários (60%)
  /--------------\
```

---

## 2. Testes Unitários

**Framework:** Jest (Node.js), Pytest (Python)  
**Cobertura Alvo:** >70%  
**Foco:** Lógica de negócio, algoritmos, validações

### Exemplo: Teste do Algoritmo TSP

```javascript
// tsp.test.js
import { nearestNeighborTSP } from './tsp-algorithm';

describe('TSP Algorithm', () => {
  it('should calculate route for 3 products', () => {
    const entrada = { id: 1, x: 0, y: 0 };
    const checkout = { id: 5, x: 100, y: 0 };
    const products = [
      { id: 101, node: { id: 2, x: 20, y: 10 } },
      { id: 102, node: { id: 3, x: 50, y: 10 } },
      { id: 103, node: { id: 4, x: 80, y: 10 } }
    ];
    
    const route = nearestNeighborTSP(entrada, checkout, products);
    
    expect(route.sequence).toHaveLength(5); // entrada + 3 produtos + checkout
    expect(route.products).toEqual([101, 102, 103]);
    expect(route.total_distance).toBeGreaterThan(0);
    expect(route.estimated_time).toBeGreaterThan(0);
  });
  
  it('should complete in <2s for 50 products (RNF-028)', () => {
    const start = Date.now();
    const products = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      node: { id: i + 10, x: Math.random() * 100, y: Math.random() * 100 }
    }));
    
    const route = nearestNeighborTSP(entrada, checkout, products);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(2000); // 2 segundos (RNF-028)
  });
});
```

---

## 3. Testes de Integração

**Framework:** Supertest (API), Testing Library (React)  
**Foco:** Endpoints da API, fluxos de dados

### Exemplo: Teste de Endpoint de Busca

```javascript
// search.test.js
import request from 'supertest';
import app from '../app';

describe('GET /api/products/search', () => {
  it('should return products matching query', async () => {
    const response = await request(app)
      .get('/api/products/search')
      .query({ filial_id: 'uuid-teste', q: 'arroz' })
      .expect(200);
    
    expect(response.body.results).toBeInstanceOf(Array);
    expect(response.body.results.length).toBeGreaterThan(0);
    expect(response.body.results[0]).toHaveProperty('nome');
    expect(response.body.results[0].nome.toLowerCase()).toContain('arroz');
  });
  
  it('should return in <300ms (RNF-029)', async () => {
    const start = Date.now();
    await request(app)
      .get('/api/products/search')
      .query({ filial_id: 'uuid-teste', q: 'café' });
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(300);
  });
});
```

---

## 4. Testes End-to-End

**Framework:** Cypress  
**Foco:** Jornada completa do usuário

### Caso de Teste: Fluxo Completo de Compra

```javascript
// e2e/shopping-flow.cy.js
describe('Shopping Flow', () => {
  it('should complete full shopping journey', () => {
    // 1. Escanear QR
    cy.visit('/f/550e8400-e29b-41d4-a716-446655440000');
    cy.contains('Supermercado Piloto').should('be.visible');
    
    // 2. Buscar produto
    cy.get('input[placeholder="Buscar produto..."]').type('arroz');
    cy.get('.prod-grid').should('contain', 'Arroz');
    
    // 3. Adicionar à lista
    cy.contains('Arroz').parent().find('button').click();
    cy.get('#cartCount').should('contain', '1');
    
    // 4. Calcular rota
    cy.get('#routeBtn').click();
    cy.url().should('include', '/rota');
    cy.get('#map').should('be.visible');
    
    // 5. Marcar como encontrado
    cy.get('.stop').first().find('.check').click();
    cy.get('.stop').first().should('have.class', 'done');
    
    // 6. Verificar conclusão
    cy.get('#doneCard').should('be.visible');
  });
});
```

---

## 5. Testes de Carga

**Framework:** K6  
**Foco:** Performance sob alta demanda

### Teste: Throughput da API (RNF-030)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up
    { duration: '5m', target: 1000 }, // Sustain 1000 VUs
    { duration: '2m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requests <500ms
    http_req_failed: ['rate<0.01'],   // <1% de erros
  },
};

export default function () {
  const response = http.get('http://api.achai.com.br/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

---

## 6. Checklist de Teste por Feature

### RF-001: QR Code
- [ ] QR gera UUID único
- [ ] QR redireciona para URL correta
- [ ] QR inválido retorna 404
- [ ] Sessão é criada ao escanear

### RF-003: Busca de Produtos
- [ ] Busca retorna resultados relevantes
- [ ] Busca parcial funciona ("arr" → "arroz")
- [ ] Busca em <300ms (RNF-029)
- [ ] Produtos indisponíveis aparecem acinzentados

### RF-007: Cálculo de Rota
- [ ] Rota inicia na entrada e termina no checkout
- [ ] Produtos sem localização não entram na rota
- [ ] Cálculo em <2s para 50 itens (RNF-028)
- [ ] Recalcula ao adicionar/remover item

---

**Anterior:** [19. Processos de Implantação](./19-processos-implantacao.md)  
**Próximo:** [21. Critérios de Aceitação](./21-criterios-aceitacao.md)
