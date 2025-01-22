document.addEventListener('DOMContentLoaded', async () => {
    const propertyShowcaseElement = document.querySelector('.property-grid');

    try {
        console.log("Buscando imóveis...");
        const response = await fetch('https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/imoveis-destaque');
        console.log("Resposta da API:", response);

        if (!response.ok) {
            throw new Error('Erro ao buscar imóveis.');
        }
        const imoveis = await response.json();
        console.log("Imóveis recebidos:", imoveis);

        // Limpa o grid de propriedades apenas uma vez
        propertyShowcaseElement.innerHTML = '';

        // Adiciona os imóveis no grid
        imoveis.forEach(imovel => {
            try {
                console.log(`Processando imóvel ID ${imovel.id}...`);
        
                // Verifica e converte o campo photos para um array JSON válido
                let photosArray;
                if (typeof imovel.photos === 'string') {
                    // Caso photos seja uma string separada por vírgulas, converte para um array
                    if (imovel.photos.includes(',')) {
                        photosArray = imovel.photos.split(',').map(url => url.trim());
                    } else {
                        // Caso seja uma única URL, cria um array com ela
                        photosArray = [imovel.photos];
                    }
                } else if (Array.isArray(imovel.photos)) {
                    // Caso já seja um array, utiliza diretamente
                    photosArray = imovel.photos;
                } else {
                    throw new Error(`Formato inválido para photos: ${imovel.photos}`);
                }
        
                console.log(`Photos processadas para imóvel ID ${imovel.id}:`, photosArray);
        
                const photosHTML = photosArray.map(photo => `
                    <img src="${photo}" alt="${imovel.propertyType} em ${imovel.city}" class="property-image"
                         onerror="this.onerror=null; this.src='https://s3.sa-east-1.amazonaws.com/meu-bucket-ipermutei/uploads/1731011218777_baixados(1).jpeg';">
                `).join('');
        
                const propertyCard = `
                    <div class="property-card">
                        <div class="property-images">
                            ${photosHTML}
                        </div>
                        <div class="property-details">
                            <h3>${imovel.propertyType} em ${imovel.city}</h3>
                            <p>${imovel.bedrooms} quartos | ${imovel.bathrooms} banheiros | ${imovel.area}m²</p>
                            <p><strong>Preço:</strong> R$${imovel.price.toLocaleString()}</p>
                        </div>
                    </div>
                `;
        
                propertyShowcaseElement.innerHTML += propertyCard;
        
            } catch (error) {
                console.error(`Erro ao processar JSON de photos para o imóvel ID ${imovel.id}:`, error);
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        propertyShowcaseElement.innerHTML = '<p>Não foi possível carregar os imóveis no momento.</p>';
    }
});
