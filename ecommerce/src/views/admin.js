export function AdminView(){
    return `
    <nav id=nav_bar>
        <a href=#admin>Home</a>
        <a href=#admin/productos>Productos</a>
        <button id='btn-logout'>Logout</button>
    <nav>
    <div id="admin-content">
    </div>
  `;
}

// Home

export function home(){
    const content = document.getElementById('admin-content');
    content.innerHTML = ''
    content.innerHTML = `
    <h2> Bienvenido Admin </h2>
    <input type="file" id="fileInput" />
    <button id="uploadBtn">Subir archivo</button>
    `
    const input = document.getElementById('fileInput');
    const btn = document.getElementById('uploadBtn');
    btn.addEventListener('click', () => {
        if (input.files.length === 0){
            alert('Selecciona un archivo primero');
            return
        }
        const file = input.files[0];
        console.log('Archivo seleccionado', file)
        //Logica:
    //     const file = input.files[0];
    //     const formData = new FormData();
    //     formData.append('file', file);

    //     fetch('/upload', {
    //     method: 'POST',
    //     body: formData,
    //     })
    //     .then(res => res.json())
    //     .then(data => alert(data.message))
    //     .catch(err => alert('Error: ' + err.message));
    // });
    })
}

// Productos

export function products(){
    const content = document.getElementById('admin-content');
    content.innerHTML = ''
    content.innerHTML = `
    <table id="productsTable">
        <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Categoria</th>
            <th>Precio unidad</th>
        </tr>
    </table>
    `;
    agregarProductos();
}

function agregarProductos(){
    const table = document.getElementById('productsTable');
    const row = document.createElement('tr');
    row.innerHTML = `
    <td>1</td>
    <td>Audifonos</td>
    <td>Tech</td>
    <td>100.000</td>
    `
    table.appendChild(row);
}

// Logout

export function logout(){
    document.getElementById('btn-logout').addEventListener('click', (e) => {
        e.preventDefault();
        console.log('holaa')
        localStorage.removeItem('user');
        window.location.hash = '';
    })
}