document.getElementById('property-search-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const propertyType = document.getElementById('propertyType').value;
  const city = document.getElementById('city').value;
  const neighborhood = document.getElementById('neighborhood').value;
  const minArea = document.getElementById('min-area').value;
  const bedrooms = document.getElementById('bedrooms').value;
  const parking = document.getElementById('parking').value;
  
  const minPrice = parseFloat(document.getElementById('min-price').value.replace(/[R$\s.]/g, '').replace(',', '.')) || null;
  const maxPrice = parseFloat(document.getElementById('max-price').value.replace(/[R$\s.]/g, '').replace(',', '.')) || null;

  const queryParams = new URLSearchParams();
  if (propertyType) queryParams.append('propertyType', propertyType);
  if (city) queryParams.append('city', city);
  if (neighborhood) queryParams.append('neighborhood', neighborhood);
  if (minArea) queryParams.append('minArea', minArea);
  if (bedrooms) queryParams.append('bedrooms', bedrooms);
  if (parking) queryParams.append('parking', parking);
  if (minPrice !== null) queryParams.append('minPrice', minPrice);
  if (maxPrice !== null) queryParams.append('maxPrice', maxPrice);

  // Buscar imóveis do backend
  fetch(`https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/buscar-imoveis?${queryParams.toString()}`)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao buscar imóveis do backend');
      return response.json();
    })
    .then(properties => {
      displayProperties(properties, 'resultContainer');
    })
    .catch(error => {
      console.error('Erro ao buscar imóveis do backend:', error);
      alert('Erro ao buscar imóveis. Tente novamente.');
    });

  // Buscar imóveis da sandbox
  fetchPropertiesFromSandbox();
});

// Função para buscar imóveis na sandbox
function fetchPropertiesFromSandbox() {
  const sandboxUrl = "http://sandbox-rest.vistahost.com.br/imoveis/listar?key=c9fdd79584fb8d369a6a579af1a8f681&showtotal=1&pesquisa=";
  const pesquisaParams = {
    fields: ["Codigo", "Categoria", "Bairro", "Cidade", "ValorVenda", "ValorLocacao", "Dormitorios", "Suites", "Vagas", "AreaTotal", "AreaPrivativa", "Caracteristicas", "InfraEstrutura"],
    order: { Bairro: "asc" },
    paginacao: { pagina: 1, quantidade: 10 }
  };
  
  fetch(sandboxUrl + encodeURIComponent(JSON.stringify(pesquisaParams)))
    .then(response => {
      if (!response.ok) throw new Error('Erro ao buscar imóveis da sandbox');
      return response.json();
    })
    .then(sandboxProperties => {
      displayProperties(sandboxProperties.imoveis, 'sandboxResultContainer');
    })
    .catch(error => {
      console.error('Erro ao buscar imóveis da sandbox:', error);
      alert('Erro ao buscar imóveis da sandbox. Tente novamente.');
    });
}

// Função para exibir imóveis
function displayProperties(properties, containerId) {
  const resultContainer = document.getElementById(containerId);
  resultContainer.innerHTML = '';

  if (properties && properties.length > 0) {
    properties.forEach(property => {
      resultContainer.innerHTML += `
        <div class="property">
          <h3>${property.Categoria || property.propertytype} - ${property.Cidade || property.city}, ${property.Bairro || property.neighborhood}</h3>
          <p>Área: ${property.AreaTotal || property.area || 'N/A'} m²</p>
          <p>Quartos: ${property.Dormitorios || property.bedrooms || 'N/A'}</p>
          <p>Vagas de garagem: ${property.Vagas || property.parkingspaces || 'N/A'}</p>
          <p>Preço: R$ ${property.ValorVenda || property.price ? parseFloat(property.ValorVenda || property.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</p>
          <button onclick="fetchPropertyDetails(${property.Codigo || property.id})">Ver Detalhes</button>
          <p>Descrição: ${property.Caracteristicas || property.description || 'N/A'}</p>
        </div>
      `;
    });
  } else {
    resultContainer.innerHTML = '<p>Nenhum imóvel encontrado.</p>';
  }
}

// Função para buscar detalhes de um imóvel específico na sandbox
function fetchPropertyDetails(imovelId) {
  if (!imovelId) {
    alert('Código do imóvel não disponível para detalhes.');
    return;
  }
  
  fetch(`http://sandbox-rest.vistahost.com.br/api/imoveis/detalhes?imovelId=${imovelId}`)
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
