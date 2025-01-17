document.addEventListener('DOMContentLoaded', async () => {
    const propertyShowcaseElement = document.querySelector('.property-grid');

    try {
        const response = await fetch('https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/imoveis-destaque');
        if (!response.ok) {
            throw new Error('Erro ao buscar imóveis.');
        }
        const imoveis = await response.json();

        // Limpa o grid de propriedades
        propertyShowcaseElement.innerHTML = '';

        // Adiciona os imóveis no grid
        imoveis.forEach(imovel => {
            const photos = imovel.photos.map(photo => `
                <img src="${photo}" alt="${imovel.propertyType} em ${imovel.city}" class="property-image" 
                     onerror="this.src='default-image-path.jpg';">
            `).join('');

            const propertyCard = `
                <div class="property-card">
                    <div class="property-images">
                        ${photos}
                    </div>
                    <div class="property-details">
                        <h3>${imovel.propertyType} em ${imovel.city}</h3>
                        <p>${imovel.bedrooms} quartos | ${imovel.bathrooms} banheiros | ${imovel.area}m²</p>
                        <p><strong>Preço:</strong> R$${imovel.price.toLocaleString()}</p>
                    </div>
                </div>
            `;
            propertyShowcaseElement.innerHTML += propertyCard;
        });
    } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        propertyShowcaseElement.innerHTML = '<p>Não foi possível carregar os imóveis no momento.</p>';
    }
});
