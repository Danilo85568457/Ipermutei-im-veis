document.addEventListener('DOMContentLoaded', async () => {
    const propertyShowcaseElement = document.querySelector('.property-grid');

    if (!propertyShowcaseElement) {
        console.error("Elemento '.property-grid' não encontrado.");
        return;
    }

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

        // Função para exibir imóveis
        function displayProperties(properties) {
            if (!Array.isArray(properties) || properties.length === 0) {
                propertyShowcaseElement.innerHTML = '<p>Nenhum imóvel encontrado.</p>';
                return;
            }

            properties.forEach(imovel => {
                try {
                    console.log(`Processando imóvel ID ${imovel.id}...`);

                    let photosArray = [];

                    if (typeof imovel.photos === 'string') {
                        console.log(`Fotos como string para o imóvel ID ${imovel.id}: ${imovel.photos}`);
                        if (imovel.photos.startsWith('[')) {
                            photosArray = JSON.parse(imovel.photos);
                        } else if (imovel.photos.includes(',')) {
                            photosArray = imovel.photos.split(',').map(url => url.trim());
                        } else {
                            photosArray = [imovel.photos.trim()];
                        }
                    } else if (Array.isArray(imovel.photos)) {
                        console.log(`Fotos como array para o imóvel ID ${imovel.id}:`, imovel.photos);
                        photosArray = imovel.photos;
                    }
                    
                    // Filtra apenas URLs válidas
                    photosArray = photosArray.filter(photo => photo.startsWith('https') || photo.startsWith('./'));
                

                    if (photosArray.length === 0) {
                        console.warn(`Imóvel ID ${imovel.id} ignorado por não ter fotos.`);
                        return;
                    }

                    console.log(`Fotos filtradas para o imóvel ID ${imovel.id}:`, photosArray);

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

        // Exibe os imóveis
        displayProperties(imoveis);

    } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
    }
});
function configurarCarrossel(cardElement) {
    const carousel = cardElement.querySelector('.carousel');
    const leftArrow = cardElement.querySelector('.arrow-left');
    const rightArrow = cardElement.querySelector('.arrow-right');
    const images = carousel.querySelectorAll('img');
    
    let currentIndex = 0;

    function updateCarousel() {
        images.forEach((img, index) => {
            img.classList.remove('active');
            if (index === currentIndex) {
                img.classList.add('active');
            }
        });
    }

    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        updateCarousel();
    });

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });

    updateCarousel();
}

  
