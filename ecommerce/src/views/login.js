export function loginView(){
    return `
    <h3 id='login-message'></h3>
    <form id="login-form">
        <h2>Iniciar sesión</h2>
        <div>
            <label for="username">Nombre de usuario:</label>
            <input type="text" id="username" name="username" required />
        </div>
        <div>
            <label for="password">Contraseña:</label>
            <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">Entrar</button>
    </form>
    `
}

export function login(){
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password: pass })
            });
            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el login');
            }
            const data = await response.json();
            localStorage.setItem("user",data.rol);
            location.hash = data.rol;
        } catch (error) {
            const login_error = document.getElementById('login-message')
            login_error.textContent = error.message;
            setTimeout(() => {
                login_error.textContent='';
                }, 3000);
        }
    });
}