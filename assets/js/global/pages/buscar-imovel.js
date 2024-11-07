document.getElementById('property-search-form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const city = document.getElementById('city').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const minArea = document.getElementById('min-area').value;
    const bedrooms = document.getElementById('bedrooms').value;
    const parking = document.getElementById('parking').value;
    const minPrice = document.getElementById('min-price').value.replace('R$', '').trim();
    const maxPrice = document.getElementById('max-price').value.replace('R$', '').trim();

    // Monta a query string com os parâmetros de busca
    const queryParams = new URLSearchParams({
      city,
      neighborhood,
      minArea,
      bedrooms,
      parking,
      minPrice,
      maxPrice
    }).toString();

    // Faz a requisição para o servidor para buscar os imóveis
    fetch(`/api/buscar-imoveis?${queryParams}`)
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
            <p>Preço: R$ ${property.price}</p>
            <p>Descrição: ${property.description}</p>
            ${property.photos ? property.photos.map(photo => `
              <img src="${photo.location}" alt="Foto do imóvel" class="property-photo">
            `).join('') : ''}
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
