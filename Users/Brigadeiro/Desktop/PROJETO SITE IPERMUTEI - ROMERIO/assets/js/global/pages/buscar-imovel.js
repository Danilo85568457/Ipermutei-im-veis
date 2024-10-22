

const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');

function formatCurrency(input) {
    let value = input.value.replace(/\D/g, '');
    value = (parseInt(value) / 100).toFixed(2);
    input.value = value.replace('.', ',');
    input.value = 'R$ ' + input.value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

minPriceInput.addEventListener('input', function(e) {
    formatCurrency(e.target);
});

maxPriceInput.addEventListener('input', function(e) {
    formatCurrency(e.target);
});

document.getElementById('property-search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    const formData = new FormData(e.target);
    const searchData = Object.fromEntries(formData.entries());
    console.log('Search criteria:', searchData);
    
    // Redirect to the specified page
    window.location.href = 'https://websim.ai/p/27rcsnias5_5b3x5ms5_/127';
});
