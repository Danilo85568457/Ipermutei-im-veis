// Manipulador do envio do formulário
document.getElementById('property-search-form').addEventListener('submit', function (event) {
  event.preventDefault();

  // Parâmetros para o backend local
  const searchParams = getSearchParams();
  console.log('Parâmetros enviados para o backend local:', searchParams); // Log dos parâmetros

  fetch(`https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/buscar-imoveis?${searchParams}`)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao buscar imóveis do backend');
      return response.json();
    })
    .then(properties => {
      console.log('Propriedades retornadas do backend local:', properties); // Log da resposta do backend local
      displayProperties(properties, 'resultContainer');
    })
    .catch(error => {
      console.error('Erro ao buscar imóveis do backend:', error);
      alert('Erro ao buscar imóveis do backend. Tente novamente.');
    });

  // Parâmetros para a sandbox da CRM
  const searchParamsForSandbox = getSearchParamsAsObject();
  console.log('Parâmetros para a sandbox:', searchParamsForSandbox); // Log dos parâmetros da sandbox

  // URL gerada
  const url = `https://sandbox-rest.vistahost.com.br/imoveis/listar?key=c9fdd79584fb8d369a6a579af1a8f681&showtotal=1&pesquisa=${encodeURIComponent(JSON.stringify({
    fields: ["Codigo", "Categoria", "Bairro", "Cidade", "ValorVenda", "ValorLocacao", "Dormitorios", "Suites", "Vagas", "AreaTotal"],
    filter: searchParamsForSandbox
  }))}`;

  console.log('URL gerada para a sandbox:', url); // Log da URL gerada para a sandbox

  // Requisição com o cabeçalho "Accept: application/json"
  fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('Erro ao buscar imóveis da sandbox');
      return response.json();
    })
    .then(properties => {
      console.log('Propriedades retornadas da sandbox:', properties); // Log das propriedades da resposta da sandbox
      displayProperties(properties.imoveis, 'sandboxResultContainer');
    })
    .catch(error => {
      console.error('Erro ao buscar imóveis da sandbox:', error);
      alert('Erro ao buscar imóveis da sandbox. Tente novamente.');
    });
});

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


function displayProperties(properties, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Limpa resultados anteriores

  // Verificação de segurança para garantir que 'properties' seja um array
  if (!Array.isArray(properties) || !properties.length) {
    container.innerHTML = '<p>Nenhum imóvel encontrado.</p>';
    return;
  }

  properties.forEach(property => {
    const propertyElement = document.createElement('div');
    propertyElement.className = 'property-item';

    // Criação de elementos para evitar uso de innerHTML
    const title = document.createElement('h3');
    title.textContent = property.Codigo || property.id;

    const cityParagraph = document.createElement('p');
    cityParagraph.innerHTML = `<strong>Cidade:</strong> ${property.Cidade || property.city}`;

    const neighborhoodParagraph = document.createElement('p');
    neighborhoodParagraph.innerHTML = `<strong>Bairro:</strong> ${property.Bairro || property.neighborhood}`;

    const priceParagraph = document.createElement('p');
    priceParagraph.innerHTML = `<strong>Preço:</strong> R$ ${property.ValorVenda || property.price}`;

    // Adicionando os elementos ao container
    propertyElement.appendChild(title);
    propertyElement.appendChild(cityParagraph);
    propertyElement.appendChild(neighborhoodParagraph);
    propertyElement.appendChild(priceParagraph);

    container.appendChild(propertyElement);
  });
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
