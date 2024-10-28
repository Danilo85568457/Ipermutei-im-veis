
        let currentSlide = 0;
        const carousel = document.querySelector('.carousel');
        const slides = document.querySelectorAll('.carousel-item');
        const totalSlides = slides.length;

        function moveCarousel(direction) {
            currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
            updateCarousel();
        }

        function updateCarousel() {
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        }

        function dislike() {
            loadNextProperty();
        }

        function filter() {
            window.location.href = 'https://websim.ai/p/27rcsnias5_5b3x5ms5_/115';
        }

        function like() {
            const modal = document.getElementById('likeModal');
            modal.style.display = 'block';
        }

        function closeModal() {
            const modal = document.getElementById('likeModal');
            modal.style.display = 'none';
        }

        function authorizeAction() {
            console.log('Action authorized');
            closeModal();
            // Add any additional logic for when the user authorizes the action
        }

        // Event listeners
        document.getElementById('authorizeButton').addEventListener('click', authorizeAction);

        // Close the modal if the user clicks outside of it
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('likeModal');
            if (event.target == modal) {
                closeModal();
            }
        });

        function loadNextProperty() {
            const titles = [
                "Casa de Campo com Piscina",
                "Loft Moderno no Centro",
                "Cobertura Duplex com Terraço",
                "Chalé em Condomínio Fechado"
            ];
            const descriptions = [
                "Encantadora casa com 4 quartos, piscina e amplo jardim, perfeita para famílias. Localizada em um condomínio fechado com segurança 24 horas, oferece tranquilidade e contato com a natureza. Ideal para quem busca qualidade de vida longe da agitação da cidade.",
                "Espaço eficiente e estiloso, ideal para solteiros ou casais, próximo a restaurantes e vida noturna. Com design contemporâneo, pé-direito alto e acabamentos premium, este loft é perfeito para quem aprecia um estilo de vida urbano e sofisticado.",
                "Vista panorâmica, 3 suítes, área gourmet e jacuzzi na cobertura. Este imóvel exclusivo oferece o máximo em luxo e conforto, com amplos espaços para entretenimento e relaxamento. Perfeito para quem busca um estilo de vida premium no coração da cidade.",
                "Aconchegante chalé com 2 quartos, lareira e acesso a trilhas naturais. Situado em um condomínio ecológico, este imóvel é ideal para quem busca paz e conexão com a natureza. Perfeito para fins de semana ou como residência permanente para amantes do ar puro."
            ];
            const details = [
                ["200m²", "4 quartos", "3 vagas", "Condomínio fechado"],
                ["70m²", "1 quarto", "1 vaga", "Design moderno"],
                ["180m²", "3 suítes", "2 vagas", "Vista panorâmica"],
                ["100m²", "2 quartos", "1 vaga", "Contato com a natureza"]
            ];

            const randomIndex = Math.floor(Math.random() * titles.length);

            // Update carousel images
            slides.forEach((slide, index) => {
                slide.querySelector('img').src = `https://picsum.photos/1200/400?random=${randomIndex * 3 + index + 1}`;
            });

            document.querySelector('.card-title').textContent = titles[randomIndex];
            document.querySelector('.card-description').textContent = descriptions[randomIndex];
            
            const detailsContainer = document.querySelector('.card-details');
            detailsContainer.innerHTML = '';
            details[randomIndex].forEach(detail => {
                const span = document.createElement('span');
                span.textContent = detail;
                detailsContainer.appendChild(span);
            });

            currentSlide = 0;
            updateCarousel();

            const card = document.querySelector('.card');
            card.style.animation = 'none';
            card.offsetHeight; 
            card.style.animation = null;
        }
   