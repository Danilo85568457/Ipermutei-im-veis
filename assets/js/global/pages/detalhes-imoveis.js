// Captura o ID do imóvel da URL
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

// Faz uma requisição para obter os dados do imóvel
fetch(`https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/get-property?id=${propertyId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const property = data.property;

            // Exibe os dados do imóvel na página
            document.querySelector('.property-details').innerHTML = `
                <p><span class="highlight">Endereço:</span> ${property.address}</p>
                <p><span class="highlight">CEP:</span> ${property.cep}</p>
                <p><span class="highlight">Bairro:</span> ${property.neighborhood}</p>
                <p><span class="highlight">Cidade/Estado:</span> ${property.city}</p>
                <p><span class="highlight">Quartos:</span> ${property.bedrooms} (sendo ${property.suites} suítes)</p>
                <p><span class="highlight">Banheiros:</span> ${property.bathrooms}</p>
                <p><span class="highlight">Vagas de Garagem:</span> ${property.parking_spaces}</p>
                <p><span class="highlight">Área:</span> ${property.area} m²</p>
                <p><span class="highlight">Valor:</span> R$ ${property.price}</p>
                <p><span class="highlight">Descrição:</span> ${property.description}</p>
            `;
        } 
    })
    .catch(error => {
        console.error('Erro ao buscar os dados do imóvel:', error);
        alert('Erro ao carregar os detalhes do imóvel.');
    });
