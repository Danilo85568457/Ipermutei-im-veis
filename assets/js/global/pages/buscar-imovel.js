// Manipulador do envio do formulário
document.getElementById('property-search-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const isSandboxTestMode = true; // Altere para false quando não estiver testando a sandbox

  const result = [];

  // Fluxo principal do código para o backend local
  const searchParams = getSearchParams();
  console.log('Parâmetros enviados para o backend local:', searchParams); // Log dos parâmetros

  fetch(`https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/buscar-imoveis`)
    .then(response => {
      if (!response.ok) throw new Error('Erro ao buscar imóveis do backend');
      return response.json();
    })
    .then(properties => {
      console.log('Propriedades retornadas do backend local:', properties);
      properties.forEach(p => result.push({...p, propertytype: p.propertytype}))
      // displayProperties(properties, 'resultContainer');
    })
    .catch(error => {
      console.error('Erro ao buscar imóveis do backend:', error);
      alert('Erro ao buscar imóveis do backend. Tente novamente.');
    });

  // Fluxo para a sandbox
  const searchParamsForSandbox = isSandboxTestMode
    ? getSimplifiedSearchParams()
    : getSearchParamsAsObject();

  console.log('Parâmetros para a sandbox:', searchParamsForSandbox);

  const url = `https://danielaf-rest.vistahost.com.br/imoveis/listar?key=0cac1b38e15f9ab12a8e4070b2f168fe&showtotal=1&pesquisa=${encodeURIComponent(JSON.stringify({
    fields: [
      "Codigo",
      "Categoria",
      "Bairro",
      "Cidade",
      "ValorVenda",
      "ValorLocacao",
      "Dormitorios",
      "Suites",
      "Vagas",
      "AreaTotal",
      "BanheiroSocialQtd"
    ],
    // filter: searchParamsForSandbox
  }))}`;


  console.log('URL gerada para a sandbox:', url);

  fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Erro ao buscar imóveis: ${response.status}`);
      }
      return response.json(); // Converte a resposta para JSON
    })
    .then(async data => {
      console.log('Dados originais:', data);

      // Transforme o objeto de propriedades em um array, caso necessário
      let properties = Array.isArray(data) ? data : Object.values(data);
      properties = properties.filter(p => p.Codigo)

      // adicionar um fetch
      for await (const property of properties) {
        const images = await fetchPropertyDetailsAndAddImages(property)
        property["Foto"] = images
        result.push({
          id: property.Codigo,
          propertyType: property.Categoria,
          city: property.Cidade,
          neighborhood: property.Bairro,
          price: property.ValorVenda,
          area: property.AreaTotal,
          bedrooms: property.Dormitorios,
          bathrooms: property.BanheiroSocialQtd,
          suites: property.Suites,
          parkingspaces: property.Vagas,
          photos: images.map(i => i.FotoPequena)
        })
      }
      // result.push(...properties)

      // Chame a função de exibição de imóveis
      displayProperties(result, 'sandboxResultContainer');
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

async function fetchPropertyDetailsAndAddImages(property) {
  console.log("cÓdigo do imÓvel", property.Codigo)
  const detailsUrl = `https://danielaf-rest.vistahost.com.br/imoveis/detalhes?key=0cac1b38e15f9ab12a8e4070b2f168fe&imovel=${property.Codigo}&pesquisa={"fields":["Codigo","Categoria","Bairro","Cidade","ValorVenda","ValorLocacao","Dormitorios","Suites","Vagas","AreaTotal","AreaPrivativa",{"Foto":["Foto","FotoPequena","Destaque"]},"Caracteristicas","InfraEstrutura"]}`;

  let images = []
  await fetch(detailsUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        console.log("Deu erro aqui", response)
      }
      return response.json();
    }).then(details => {
      images = details?.Foto ? Object.values(details?.Foto || []) : []
    })
    .catch(error => {
      console.error('Erro ao buscar detalhes do imóvel:', error);
    })
  return images
}


function displayProperties(properties, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Limpa resultados anteriores

  // Verificação para garantir que 'properties' seja um array válido
  if (!Array.isArray(properties) || !properties.length) {
    container.innerHTML = '<p>Nenhum imóvel encontrado.</p>';
    return;
  }

  const propertyShowcaseElement = document.querySelector('.property-grid');
  propertyShowcaseElement.innerHTML = '';

  properties.forEach(imovel => {
    try {
      console.log(`Processando imóvel ID ${imovel.id}...`);

      // Verifica e converte o campo photos para um array JSON válido
      let photosArray = [];

      if (typeof imovel.photos === 'string') {
        if (imovel.photos.startsWith('[')) {
          photosArray = JSON.parse(imovel.photos);
        } else if (imovel.photos.includes(',')) {
          photosArray = imovel.photos.split(',').map(url => url.trim());
        } else {
          photosArray = [imovel.photos.trim()];
        }
      } else if (Array.isArray(imovel.photos)) {
        photosArray = imovel.photos;
      }

      // Filtrar apenas fotos válidas
      photosArray = photosArray.filter(photo => photo.startsWith('https') || photo.startsWith('./'));

      console.log(`Photos processadas para imóvel ID ${imovel.id}:`, photosArray);

      if (photosArray.length === 0) {
        console.warn(`Imóvel ID ${imovel.id} ignorado por não ter fotos.`);
        return;
      }

      const photosHTML = photosArray.map((photo, i) => `
        <img src="${photo}" alt="${imovel.propertyType} em ${imovel.city}" class="property-image ${i === 0 ? 'active' : ''}">
      `).join('');

      const propertyCardElement = document.createElement('div');
      propertyCardElement.classList.add('property-card');
      propertyCardElement.setAttribute('data-card', imovel.id);
      propertyCardElement.innerHTML = `
        <div class="property-images">
          <div class="carousel">
            ${photosHTML}
            <button class="arrow arrow-left">❮</button>
            <button class="arrow arrow-right">❯</button>
          </div>
        </div>
        <div class="property-details">
          <h3>${imovel.propertyType} em ${imovel.city}</h3>
          <p>${imovel.bedrooms} quartos | ${imovel.bathrooms} banheiros | ${imovel.area}m²</p>
          <p><strong>Preço:</strong> R$${imovel.price.toLocaleString()}</p>
        </div>
      `;

      propertyShowcaseElement.appendChild(propertyCardElement);
      configurarCarrossel(propertyCardElement);

    } catch (error) {
      console.error(`Erro ao processar JSON de photos para o imóvel ID ${imovel.id}:`, error);
    }
  });
}


function configurarCarrossel(card) {
  let currentIndex = 0;
  const images = card.querySelectorAll(".property-image");
  const prevButton = card.querySelector(".arrow-left");
  const nextButton = card.querySelector(".arrow-right");

  function showImage(index) {
      images.forEach((img, i) => img.classList.toggle("active", i === index));
  }

  prevButton.addEventListener("click", () => {
      currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
      showImage(currentIndex);
  });

  nextButton.addEventListener("click", () => {
      currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
      showImage(currentIndex);
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

  fetch(`http://danielaf-rest.vistahost.com.br/imoveis/detalhes?key=0cac1b38e15f9ab12a8e4070b2f168fe&imovel=1650&pesquisa={"fields":["Codigo","Categoria","Bairro","Cidade","ValorVenda","ValorLocacao","Dormitorios","Suites","Vagas","AreaTotal","AreaPrivativa","Caracteristicas","InfraEstrutura"]}${imovelId}`)
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
