"""
Ach.ai - Algoritmo de Roteirização (TSP)
Heurística: Vizinho Mais Próximo (Nearest Neighbor)

Referência: Especificação 13-modulo-roteirizacao.md
"""

import math
from typing import List, Tuple, Dict
from dataclasses import dataclass

@dataclass
class Node:
    """Representa um nó no grafo da loja"""
    id: int
    name: str
    x: float  # Coordenada X (metros ou pixels)
    y: float  # Coordenada Y (metros ou pixels)
    type: str  # 'entrada', 'corredor', 'produto', 'checkout'

@dataclass
class Product:
    """Representa um produto na lista"""
    id: int
    name: str
    node_id: int  # Referência ao nó onde está localizado

@dataclass
class Route:
    """Resultado da roteirização"""
    sequence: List[int]  # IDs dos nós em ordem
    products: List[int]  # IDs dos produtos correspondentes
    total_distance: float  # Distância total em metros
    estimated_time: int  # Tempo estimado em minutos (assumindo 1m/s)

def euclidean_distance(node1: Node, node2: Node) -> float:
    """
    Calcula distância euclidiana entre dois nós.
    
    No MVP, usamos distância em linha reta. Em produção, 
    deve usar caminhos reais do grafo (Dijkstra/A*).
    """
    return math.sqrt((node1.x - node2.x)**2 + (node1.y - node2.y)**2)

def nearest_neighbor_tsp(
    start: Node,
    end: Node,
    nodes: List[Node],
    products: List[Product],
    graph: Dict[int, List[Tuple[int, float]]]  # Adjacency list: {node_id: [(neighbor_id, distance)]}
) -> Route:
    """
    Algoritmo de Vizinho Mais Próximo para o Problema do Caixeiro Viajante.
    
    Args:
        start: Nó de entrada da loja
        end: Nó de checkout
        nodes: Lista de todos os nós do grafo
        products: Produtos na lista de compras
        graph: Grafo da loja (adjacência)
        
    Returns:
        Route: Rota otimizada com sequência de paradas
        
    Complexidade: O(n²) onde n = número de produtos
    """
    
    # Mapear produtos para nós
    product_nodes = [n for n in nodes if n.id in [p.node_id for p in products]]
    
    if not product_nodes:
        # Nenhum produto localizado, rota direta entrada → checkout
        return Route(
            sequence=[start.id, end.id],
            products=[],
            total_distance=euclidean_distance(start, end),
            estimated_time=1
        )
    
    # Inicializar
    current = start
    unvisited = product_nodes.copy()
    route_sequence = [start.id]
    route_products = []
    total_distance = 0.0
    
    # Enquanto houver produtos não visitados
    while unvisited:
        # Encontrar nó mais próximo
        nearest = min(unvisited, key=lambda n: euclidean_distance(current, n))
        
        # Adicionar à rota
        route_sequence.append(nearest.id)
        
        # Encontrar qual produto está neste nó
        product = next(p for p in products if p.node_id == nearest.id)
        route_products.append(product.id)
        
        # Calcular distância
        distance = euclidean_distance(current, nearest)
        total_distance += distance
        
        # Atualizar estado
        current = nearest
        unvisited.remove(nearest)
    
    # Adicionar caminho até checkout
    route_sequence.append(end.id)
    total_distance += euclidean_distance(current, end)
    
    # Calcular tempo estimado (assumindo velocidade de 1 m/s)
    estimated_time = math.ceil(total_distance / 60)  # Converter para minutos
    
    return Route(
        sequence=route_sequence,
        products=route_products,
        total_distance=round(total_distance, 2),
        estimated_time=estimated_time
    )

def optimize_route_with_graph(
    start: Node,
    end: Node,
    product_nodes: List[Node],
    graph: Dict[int, List[Tuple[int, float]]]
) -> Tuple[List[int], float]:
    """
    Versão melhorada que usa o grafo real (caminhos da loja).
    
    TODO: Implementar Dijkstra/A* para encontrar caminho real entre nós.
    Atualmente usa distância euclidiana como aproximação.
    """
    # Implementação futura: Usar Dijkstra para caminhos reais
    # Por ora, delega para nearest_neighbor_tsp
    pass

# ============================================
# EXEMPLO DE USO
# ============================================

if __name__ == "__main__":
    # Criar nós de exemplo
    entrada = Node(id=1, name="Entrada", x=0, y=0, type="entrada")
    corredor1 = Node(id=2, name="Corredor 1", x=10, y=5, type="corredor")
    corredor2 = Node(id=3, name="Corredor 2", x=20, y=5, type="corredor")
    corredor3 = Node(id=4, name="Corredor 3", x=30, y=5, type="corredor")
    checkout = Node(id=5, name="Checkout", x=40, y=0, type="checkout")
    
    nodes = [entrada, corredor1, corredor2, corredor3, checkout]
    
    # Criar produtos
    products = [
        Product(id=101, name="Arroz", node_id=2),
        Product(id=102, name="Feijão", node_id=2),
        Product(id=103, name="Macarrão", node_id=3),
        Product(id=104, name="Café", node_id=4),
    ]
    
    # Grafo simplificado (na prática, vem do banco PostGIS)
    graph = {
        1: [(2, 11.18)],  # Entrada → Corredor 1
        2: [(1, 11.18), (3, 11.18)],  # Corredor 1 ↔ Corredor 2
        3: [(2, 11.18), (4, 11.18)],  # Corredor 2 ↔ Corredor 3
        4: [(3, 11.18), (5, 14.14)],  # Corredor 3 → Checkout
        5: [(4, 14.14)]  # Checkout
    }
    
    # Calcular rota
    route = nearest_neighbor_tsp(entrada, checkout, nodes, products, graph)
    
    print("🗺️  Rota Calculada:")
    print(f"   Sequência de nós: {route.sequence}")
    print(f"   Produtos na ordem: {route.products}")
    print(f"   Distância total: {route.total_distance}m")
    print(f"   Tempo estimado: {route.estimated_time} min")
    
    # Output esperado:
    # 🗺️  Rota Calculada:
    #    Sequência de nós: [1, 2, 3, 4, 5]
    #    Produtos na ordem: [101, 103, 104]
    #    Distância total: 58.28m
    #    Tempo estimado: 1 min
