document.getElementById('property-search-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const propertyType = document.getElementById('propertyType').value;
  const city = document.getElementById('city').value;
  const neighborhood = document.getElementById('neighborhood').value;
  const minArea = document.getElementById('min-area').value;
  const bedrooms = document.getElementById('bedrooms').value;
  const parking = document.getElementById('parking').value;

  // Remove o símbolo de moeda e formata os preços
  const minPrice = parseFloat(document.getElementById('min-price').value.replace(/[R$\s.]/g, '').replace(',', '.')) || null;
  const maxPrice = parseFloat(document.getElementById('max-price').value.replace(/[R$\s.]/g, '').replace(',', '.')) || null;

  // Monta a query string apenas com parâmetros preenchidos
  const queryParams = new URLSearchParams();
  if (propertyType) queryParams.append('propertyType', propertyType);
  if (city) queryParams.append('city', city);
  if (neighborhood) queryParams.append('neighborhood', neighborhood);
  if (minArea) queryParams.append('minArea', minArea);
  if (bedrooms) queryParams.append('bedrooms', bedrooms);
  if (parking) queryParams.append('parking', parking);
  if (minPrice !== null) queryParams.append('minPrice', minPrice);
  if (maxPrice !== null) queryParams.append('maxPrice', maxPrice);

  // Faz a requisição para o servidor para buscar os imóveis
  fetch(`https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/buscar-imoveis?${queryParams.toString()}`)
    .then(response => response.json())
    .then(properties => {
      const resultContainer = document.getElementById('resultContainer');
      resultContainer.innerHTML = '';

      if (properties.length > 0) {
        properties.forEach(property => {
          resultContainer.innerHTML += `
            <div class="property">
              <h3>${property.property_type} - ${property.address}, ${property.neighborhood}</h3>
              <p>Área: ${property.area} m²</p>
              <p>Quartos: ${property.bedrooms}</p>
              <p>Vagas de garagem: ${property.parking_spaces}</p>
              <p>Preço: R$ ${parseFloat(property.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p>Descrição: ${property.description}</p>
              <div class="property-photos">
                ${property.photos && property.photos.length ? property.photos.map(photo => `
                  <img src="${photo}" alt="Foto do imóvel" class="property-photo">
                `).join('') : '<p>Sem fotos disponíveis.</p>'}
              </div>
            </div>
          `;
        });
      } else {
        resultContainer.innerHTML = '<p>Nenhum imóvel encontrado.</p>';
      }
    })
    .catch(error => {
      console.error('Erro ao buscar imóveis:', error);
      alert('Erro ao buscar imóveis. Tente novamente.');
    });
});
