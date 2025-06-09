let equipments = JSON.parse(localStorage.getItem('equipments') || '[]');
let nextId = parseInt(localStorage.getItem('nextId') || '1');

function readFileAsDataURL(file) {
  return new Promise(resolve => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

function updateStorage() {
  localStorage.setItem('equipments', JSON.stringify(equipments));
  localStorage.setItem('nextId', nextId);
}

function renderTable() {
  const tbody = document.querySelector('#equipTable tbody');
  tbody.innerHTML = '';
  equipments.forEach(eq => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${eq.id}</td>
      <td class="collab">${eq.nome}</td>
      <td>${eq.tipo}</td>
      <td><button class="remove-btn" data-id="${eq.id}">Remover</button></td>
    `;
    tbody.appendChild(tr);
    const detail = document.createElement('tr');
    detail.className = 'details';
    detail.innerHTML = `
      <td colspan="4">
        <strong>Loja:</strong> ${eq.loja}<br>
        <strong>Setor:</strong> ${eq.setor}<br>
        <strong>Função:</strong> ${eq.funcao}<br>
        <strong>Data de entrega:</strong> ${eq.data}<br>
        <strong>Patrimônio:</strong> ${eq.patrimonio}<br>
        ${eq.foto ? `<img src="${eq.foto}" width="100">` : ''}
        ${eq.termo ? `<a href="${eq.termo}" download="termo-${eq.id}">Termo assinado</a>` : ''}
      </td>`;
    tbody.appendChild(detail);
  });
  document.getElementById('totalCount').textContent = equipments.length;
  initRowEvents();
}

function initRowEvents() {
  document.querySelectorAll('#equipTable .collab').forEach((cell, index) => {
    cell.addEventListener('click', () => {
      const detailRow = cell.parentElement.nextElementSibling;
      detailRow.classList.toggle('open');
    });
  });
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      equipments = equipments.filter(eq => eq.id !== id);
      updateStorage();
      renderTable();
      updateChart();
    });
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const foto = await readFileAsDataURL(formData.get('foto'));
  const termo = await readFileAsDataURL(formData.get('termo'));
  const equipment = {
    id: nextId++,
    nome: formData.get('nome'),
    loja: formData.get('loja'),
    setor: formData.get('setor'),
    funcao: formData.get('funcao'),
    tipo: formData.get('tipo'),
    data: formData.get('data'),
    patrimonio: formData.get('patrimonio'),
    foto,
    termo
  };
  equipments.push(equipment);
  updateStorage();
  e.target.reset();
  renderTable();
  updateChart();
}

document.getElementById('equipForm').addEventListener('submit', handleSubmit);

document.getElementById('filterInput').addEventListener('input', function() {
  const value = this.value.toLowerCase();
  document.querySelectorAll('#equipTable tbody tr').forEach((tr, idx) => {
    if (tr.classList.contains('details')) return; // skip details rows
    const name = tr.children[1].textContent.toLowerCase();
    tr.style.display = name.includes(value) ? '' : 'none';
    const detailRow = tr.nextElementSibling;
    if (detailRow.classList.contains('details')) {
      detailRow.style.display = name.includes(value) ? (detailRow.classList.contains('open') ? 'table-row' : 'none') : 'none';
    }
  });
});

function updateChart() {
  const counts = equipments.reduce((acc, eq) => {
    acc[eq.tipo] = (acc[eq.tipo] || 0) + 1;
    return acc;
  }, {});
  const ctx = document.getElementById('equipChart').getContext('2d');
  if (window.equipChart) window.equipChart.destroy();
  window.equipChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Quantidade',
        data: Object.values(counts),
        backgroundColor: '#3498db'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

renderTable();
updateChart();
