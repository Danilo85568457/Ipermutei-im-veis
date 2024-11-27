// Manipulador do envio do formulário
document.getElementById('property-search-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const isSandboxTestMode = true; // Altere para false quando não estiver testando a sandbox

  if (!isSandboxTestMode) {
    // Fluxo principal do código para o backend local
    const searchParams = getSearchParams();
    console.log('Parâmetros enviados para o backend local:', searchParams); // Log dos parâmetros

    fetch(`https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/buscar-imoveis?${searchParams}`)
      .then(response => {
        if (!response.ok) throw new Error('Erro ao buscar imóveis do backend');
        return response.json();
      })
      .then(properties => {
        console.log('Propriedades retornadas do backend local:', properties);
        displayProperties(properties, 'resultContainer');
      })
      .catch(error => {
        console.error('Erro ao buscar imóveis do backend:', error);
        alert('Erro ao buscar imóveis do backend. Tente novamente.');
      });
  }

  // Fluxo para a sandbox
  const searchParamsForSandbox = isSandboxTestMode 
    ? getSimplifiedSearchParams() 
    : getSearchParamsAsObject();

  console.log('Parâmetros para a sandbox:', searchParamsForSandbox);

  const url = `https://sandbox-rest.vistahost.com.br/imoveis/listar?key=c9fdd79584fb8d369a6a579af1a8f681&showtotal=1&pesquisa=${encodeURIComponent(JSON.stringify({
    fields: ["Codigo", "Categoria", "Bairro", "Cidade", "ValorVenda", "ValorLocacao", "Dormitorios", "Suites", "Vagas", "AreaTotal"],
    filter: searchParamsForSandbox
  }))}`;

  console.log('URL gerada para a sandbox:', url);

  fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(data => {
    // Log dos dados originais para análise
    console.log('Dados originais:', data);

    // Transforme o objeto de propriedades em um array
    const properties = Object.values(data);

    // Log para verificar a estrutura transformada
    console.log('Imóveis formatados como array:', properties);

    // Chame a função de exibição de imóveis
    displayProperties(properties, 'sandboxResultContainer');
  })
  .catch(error => {
    console.error('Erro ao buscar imóveis da sandbox:', error);
    alert('Erro ao buscar imóveis da sandbox. Tente novamente.');
  });

  
});

function getSimplifiedSearchParams() {
  const propertyType = document.getElementById('propertyType').value;
  const city = document.getElementById('city').value;

  const searchParams = {};

  if (propertyType) {
    searchParams.Categoria = propertyType;
  }
  if (city) {
    searchParams.Cidade = city;
  }

  console.log('Parâmetros simplificados para a sandbox:', searchParams);
  return searchParams;
}

function getSearchParamsAsObject() {
  const propertyType = document.getElementById('propertyType').value;
  const city = document.getElementById('city').value;
  const neighborhood = document.getElementById('neighborhood').value;
  const minArea = document.getElementById('min-area').value;
  const maxArea = document.getElementById('max-area').value;
  const bedrooms = document.getElementById('bedrooms').value;
  const parking = document.getElementById('parking').value;

  const minPrice = parseFloat(
    document.getElementById('min-price').value.replace(/[R$\s.]/g, '').replace(',', '.')
  ) || null;

  const maxPrice = parseFloat(
    document.getElementById('max-price').value.replace(/[R$\s.]/g, '').replace(',', '.')
  ) || null;

  const searchParams = {};

  // Ajuste dos parâmetros conforme a documentação da API
  if (propertyType) {
    searchParams.Categoria = propertyType;
  }
  if (city) {
    searchParams.Cidade = city;
  }
  if (neighborhood) {
    searchParams.Bairro = neighborhood;
  }

  // Log para verificar os valores de área
  console.log('Min Área:', minArea, 'Max Área:', maxArea);
  // Corrigindo AreaTotal para ser um array com valor mínimo e máximo
  if (minArea && maxArea) {
    searchParams.AreaTotal = [parseInt(minArea, 10), parseInt(maxArea, 10)];
  } else if (minArea) {
    searchParams.AreaTotal = [parseInt(minArea, 10), null];  // Apenas mínimo, sem máximo
  } else if (maxArea) {
    searchParams.AreaTotal = [null, parseInt(maxArea, 10)];  // Apenas máximo, sem mínimo
  }

  // Log para verificar os valores de preço
  console.log('Min Preço:', minPrice, 'Max Preço:', maxPrice);
  // Corrigindo ValorVenda para ser um array com valor mínimo e máximo
  if (minPrice !== null && maxPrice !== null) {
    searchParams.ValorVenda = [minPrice, maxPrice];
  } else if (minPrice !== null) {
    searchParams.ValorVenda = [minPrice, null];  // Apenas valor mínimo
  } else if (maxPrice !== null) {
    searchParams.ValorVenda = [null, maxPrice];  // Apenas valor máximo
  }

  // Ajustes para outros parâmetros
  if (bedrooms) {
    searchParams.Dormitorios = { $gte: parseInt(bedrooms, 10) };  // Min dormitórios
  }
  if (parking) {
    searchParams.Vagas = { $gte: parseInt(parking, 10) };  // Min vagas
  }

  // Log dos parâmetros finais
  console.log('Parâmetros finais para a pesquisa:', searchParams);
  return searchParams;
}
function displayProperties(properties, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Limpa resultados anteriores

  // Verificação para garantir que 'properties' seja um array válido
  if (!Array.isArray(properties) || !properties.length) {
    container.innerHTML = '<p>Nenhum imóvel encontrado.</p>';
    return;
  }

  properties.forEach(property => {
    const propertyElement = document.createElement('div');
    propertyElement.className = 'property-item';

    // Título com o código do imóvel
    const title = document.createElement('h3');
    title.textContent = `${property.Categoria || 'Imóvel'} - Código: ${property.Codigo}`;

    // Cidade
    const cityParagraph = document.createElement('p');
    cityParagraph.innerHTML = `<strong>Cidade:</strong> ${property.Cidade || 'N/A'}`;

    // Bairro
    const neighborhoodParagraph = document.createElement('p');
    neighborhoodParagraph.innerHTML = `<strong>Bairro:</strong> ${property.Bairro || 'N/A'}`;

    // Preço de venda
    const priceParagraph = document.createElement('p');
    priceParagraph.innerHTML = `<strong>Preço de Venda:</strong> R$ ${property.ValorVenda || 'N/A'}`;

    // Preço de locação
    const rentParagraph = document.createElement('p');
    rentParagraph.innerHTML = `<strong>Preço de Locação:</strong> R$ ${property.ValorLocacao || 'N/A'}`;

    // Área Total
    const areaParagraph = document.createElement('p');
    areaParagraph.innerHTML = `<strong>Área Total:</strong> ${property.AreaTotal || 'N/A'} m²`;

    // Dormitórios
    const bedroomsParagraph = document.createElement('p');
    bedroomsParagraph.innerHTML = `<strong>Dormitórios:</strong> ${property.Dormitorios || 'N/A'}`;

    // Suítes
    const suitesParagraph = document.createElement('p');
    suitesParagraph.innerHTML = `<strong>Suítes:</strong> ${property.Suites || 'N/A'}`;

    // Vagas
    const parkingParagraph = document.createElement('p');
    parkingParagraph.innerHTML = `<strong>Vagas:</strong> ${property.Vagas || 'N/A'}`;

    // Adicionando os elementos ao container
    propertyElement.appendChild(title);
    propertyElement.appendChild(cityParagraph);
    propertyElement.appendChild(neighborhoodParagraph);
    propertyElement.appendChild(priceParagraph);
    propertyElement.appendChild(rentParagraph);
    propertyElement.appendChild(areaParagraph);
    propertyElement.appendChild(bedroomsParagraph);
    propertyElement.appendChild(suitesParagraph);
    propertyElement.appendChild(parkingParagraph);

    container.appendChild(propertyElement);
  });
}

// Função para retornar os parâmetros como string (para uso no backend local)
function getSearchParams() {
  const propertyType = document.getElementById('propertyType').value;
  const city = document.getElementById('city').value;
  const neighborhood = document.getElementById('neighborhood').value;
  const minArea = document.getElementById('min-area').value;
  const maxArea = document.getElementById('max-area').value;
  const bedrooms = document.getElementById('bedrooms').value;
  const parking = document.getElementById('parking').value;

  const minPrice = parseFloat(
    document.getElementById('min-price').value.replace(/[R$\s.]/g, '').replace(',', '.')
  ) || null;

  const maxPrice = parseFloat(
    document.getElementById('max-price').value.replace(/[R$\s.]/g, '').replace(',', '.')
  ) || null;

  const queryParams = new URLSearchParams();
  if (propertyType) queryParams.append('propertyType', propertyType);
  if (city) queryParams.append('city', city);
  if (neighborhood) queryParams.append('neighborhood', neighborhood);
  if (minArea) queryParams.append('minArea', minArea);
  if (maxArea) queryParams.append('maxArea', maxArea);
  if (bedrooms) queryParams.append('bedrooms', bedrooms);
  if (parking) queryParams.append('parking', parking);
  if (minPrice !== null) queryParams.append('minPrice', minPrice);
  if (maxPrice !== null) queryParams.append('maxPrice', maxPrice);

  return queryParams.toString();
}

function formatCurrency(input) {
  // Remover tudo que não seja número, exceto a vírgula
  let value = input.value.replace(/[^\d,]/g, '');

  // Se houver uma vírgula, garantimos que apenas duas casas decimais sejam permitidas
  let parts = value.split(',');

  // Limitar a quantidade de casas decimais
  if (parts[1]) {
    parts[1] = parts[1].slice(0, 2);  // Limitar a 2 casas decimais
  }

  // Reconstruir o valor com a vírgula no lugar correto
  value = parts.join(',');

  // Adicionar separador de milhar no número inteiro
  value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Se houver um número válido, atualizar o valor no campo
  input.value = 'R$ ' + value;
}

// Função para buscar detalhes de um imóvel específico na sandbox
function fetchPropertyDetails(imovelId) {
  if (!imovelId) {
    alert('Código do imóvel não disponível para detalhes.');
    return;
  }
  
  fetch(`https://sandbox-rest.vistahost.com.br/api/imoveis/detalhes?imovelId=${imovelId}`)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao buscar detalhes do imóvel');
      return response.json();
    })
    .then(details => {
      if (details) {
        document.getElementById('propertyDetailsContainer').innerHTML = `
          <h3>${details.Codigo || 'N/A'} - ${details.Cidade || 'N/A'}, ${details.Bairro || 'N/A'}</h3>
          <p>Preço: R$ ${details.ValorVenda ? parseFloat(details.ValorVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</p>
          <p>Quartos: ${details.Dormitorio || 'N/A'}</p>
          <p>Vagas: ${details.Vagas || 'N/A'}</p>
          <p>Churrasqueira: ${details.Churrasqueira ? 'Sim' : 'Não'}</p>
          <p>Lareira: ${details.Lareira ? 'Sim' : 'Não'}</p>
          <p>Descrição: ${details.Descricao || 'N/A'}</p>
          <div class="property-photos">
            ${details.fotos ? details.fotos.map(foto => `<img src="${foto.Foto}" alt="Foto do imóvel">`).join('') : '<p>Sem fotos disponíveis.</p>'}
          </div>
        `;
      } else {
        document.getElementById('propertyDetailsContainer').innerHTML = '<p>Detalhes do imóvel não encontrados.</p>';
      }
    })
    .catch(error => {
      console.error('Erro ao buscar detalhes do imóvel:', error);
      alert('Erro ao buscar detalhes do imóvel. Tente novamente.');
    });
}
