const products = [
  { id: "leite-integral-1l", name: "Leite integral 1 L", category: "Laticínios", aisle: "Corredor 3" },
  { id: "banana-prata", name: "Banana prata", category: "Hortifruti", aisle: "Setor A" },
  { id: "arroz-5kg", name: "Arroz branco 5 kg", category: "Mercearia", aisle: "Corredor 1" },
  { id: "feijao-carioca-1kg", name: "Feijão carioca 1 kg", category: "Mercearia", aisle: "Corredor 1" },
  { id: "agua-mineral-1-5l", name: "Água mineral 1,5 L", category: "Bebidas", aisle: "Corredor 5" },
  { id: "detergente-500ml", name: "Detergente 500 ml", category: "Limpeza", aisle: "Corredor 7" },
];

function getCatalog(search) {
  const normalizedSearch = typeof search === "string" ? search.trim().toLocaleLowerCase("pt-BR") : "";
  if (!normalizedSearch) return products;
  return products.filter((product) =>
    `${product.name} ${product.category}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
  );
}

module.exports = { getCatalog, products };
