
const maxPhotos = 12;
const photoUpload = document.getElementById('photoUpload');
const photoInput = document.getElementById('photoInput');
const modal = document.getElementById("successModal");
const span = document.getElementsByClassName("close")[0];
let uploadedFiles = [];

photoInput.addEventListener('change', function(e) {
  const files = Array.from(e.target.files);
  if (uploadedFiles.length + files.length > maxPhotos) {
    alert(`Você pode selecionar no máximo ${maxPhotos} fotos no total.`);
    return;
  }
  
  files.forEach(file => {
    if (uploadedFiles.length < maxPhotos) {
      uploadedFiles.push(file);
      const reader = new FileReader();
      reader.onload = function(e) {
        addPhotoPreview(e.target.result, uploadedFiles.length - 1);
      }
      reader.readAsDataURL(file);
    }
  });
  
  updatePhotoCount();
});

function addPhotoPreview(src, index) {
  const preview = document.createElement('div');
  preview.className = 'photo-preview';
  preview.innerHTML = `
    <img src="${src}" alt="Preview">
    <div class="delete-photo" onclick="deletePhoto(${index})">
      <i class="fas fa-times"></i>
    </div>
  `;
  photoUpload.appendChild(preview);
}

function deletePhoto(index) {
  uploadedFiles.splice(index, 1);
  updatePhotoDisplay();
}

function updatePhotoDisplay() {
  photoUpload.innerHTML = '';
  uploadedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      addPhotoPreview(e.target.result, index);
    }
    reader.readAsDataURL(file);
  });
  updatePhotoCount();
}

function updatePhotoCount() {
  const remainingPhotos = maxPhotos - uploadedFiles.length;
  document.getElementById('photoLabel').textContent = `Carregar as Fotos do Seu Imóvel (${uploadedFiles.length}/${maxPhotos})`;
}

const authorizeCheckbox = document.getElementById('authorizeCheckbox');
const submitButton = document.getElementById('submitButton');

authorizeCheckbox.addEventListener('change', function() {
  submitButton.disabled = !this.checked;
});

document.getElementById('propertyForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!authorizeCheckbox.checked) {
    alert('Por favor, autorize o cadastro e a divulgação do seu imóvel antes de enviar.');
    return;
  }
  this.style.display = "none";  // Hide the form
  modal.style.display = "block";  // Show the modal
});

span.onclick = function() {
  modal.style.display = "none";
  document.getElementById('propertyForm').style.display = "block";  // Show the form again when closing the modal
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    document.getElementById('propertyForm').style.display = "block";  // Show the form again when closing the modal
  }
}

// Mask for CEP field
document.getElementById('cep').addEventListener('input', function (e) {
  var x = e.target.value.replace(/\D/g, '').match(/(\d{0,5})(\d{0,3})/);
  e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2];
});

// Mask for price field
document.getElementById('price').addEventListener('input', function (e) {
  var value = e.target.value.replace(/\D/g, '');
  value = (value/100).toFixed(2) + '';
  value = value.replace(".", ",");
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  e.target.value = 'R$ ' + value;
});
