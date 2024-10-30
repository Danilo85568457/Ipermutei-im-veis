const maxPhotos = 12;
const photoUpload = document.getElementById('photoUpload');
const photoInput = document.getElementById('photoInput');
const modal = document.getElementById("successModal");
const span = document.getElementsByClassName("close")[0];
let uploadedFiles = [];

// Evento ao selecionar as fotos
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

// Habilita ou desabilita o botão de submissão com base no checkbox
authorizeCheckbox.addEventListener('change', function() {
  submitButton.disabled = !this.checked;
});

// Função para salvar os dados do formulário de cadastro
document.getElementById('propertyForm').addEventListener('submit', function(event) {
  console.log('Formulário enviado');
  event.preventDefault();

  // Captura os arquivos de foto
  const photoInput = document.getElementById('photoInput');
  const uploadedFiles = Array.from(photoInput.files);
  console.log('Arquivos de fotos carregados:', uploadedFiles);

  console.log('Arquivos de fotos carregados:', uploadedFiles); // Log para verificar se os arquivos de fotos foram capturados

  // Criação de um objeto FormData para enviar os dados do formulário e arquivos
  const formData = new FormData();
  formData.append('propertyType', document.getElementById('propertyType').value);
  formData.append('address', document.getElementById('address').value);
  formData.append('number', document.getElementById('number').value);
  formData.append('complement', document.getElementById('complement').value);
  formData.append('cep', document.getElementById('cep').value);
  formData.append('neighborhood', document.getElementById('neighborhood').value);
  formData.append('area', document.getElementById('area').value);
  formData.append('bedrooms', document.getElementById('bedrooms').value);
  formData.append('suites', document.getElementById('suites').value);
  formData.append('bathrooms', document.getElementById('bathrooms').value);
  formData.append('parkingSpaces', document.getElementById('parkingSpaces').value);
  formData.append('price', document.getElementById('price').value);
  formData.append('description', document.getElementById('description').value);

  // Adiciona as fotos ao FormData
  uploadedFiles.forEach((file, index) => {
    formData.append('photos', file);  // 'photos' será o nome do campo no servidor
  });

  // Faz a requisição para o servidor
  fetch('https://ipermuteidevdanilo-aa5a0d72264e.herokuapp.com/api/cadastro-imovel', {
    method: 'POST',
    body: formData, // O FormData já define o cabeçalho 'multipart/form-data'
  })
  .then(response => {
    console.log('Resposta do servidor:', response); // Log para verificar a resposta do servidor
    if (!response.ok) {
        throw new Error('Erro na resposta do servidor: ' + response.statusText);
    }
    return response.json();
 })
  .then(data => {
    console.log('Dados recebidos do servidor:', data); // Verificar o conteúdo da resposta
    if (data.message) {
      alert(data.message); // Exibe mensagem de sucesso
      // Oculta o formulário e exibe o modal de sucesso
      document.getElementById('propertyForm').style.display = "none";
      document.getElementById('successModal').style.display = "block";
    } else {
      alert('Erro ao cadastrar o imóvel.');
    }
  })
  .catch(error => {
    console.error('Erro ao cadastrar imóvel:', error); // Log para capturar possíveis erros no envio
    alert('Erro ao cadastrar o imóvel. Tente novamente.');
  });
});
 


// Funções para controle do modal de sucesso
span.onclick = function() {
  modal.style.display = "none";
  document.getElementById('propertyForm').style.display = "block";  
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    document.getElementById('propertyForm').style.display = "block";  
  }
}

// Máscara para o campo de CEP
document.getElementById('cep').addEventListener('input', function (e) {
  var x = e.target.value.replace(/\D/g, '').match(/(\d{0,5})(\d{0,3})/);
  e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2];
});

// Máscara para o campo de preço
document.getElementById('price').addEventListener('input', function (e) {
  var value = e.target.value.replace(/\D/g, '');
  value = (value/100).toFixed(2) + '';
  value = value.replace(".", ",");
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  e.target.value = 'R$ ' + value;
});
