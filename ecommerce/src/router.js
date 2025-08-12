import { AdminView, home, logout, products } from './views/admin'
import { loginView, login } from './views/login'
export function router() {
    let rol = localStorage.getItem('user');
    let app = document.getElementById('app');
    const route = location.hash.slice(1);
    if (!rol){
        app.innerHTML = loginView();
        login();
    }
    else if (rol == 'usuario' ){
        console.log('Entró usuario')
    }
    else if(rol == 'admin'){
        app.innerHTML = AdminView();
        logout();
        switch(route){
            case 'admin':
                home();
                break;
            case 'admin/productos':
                products();
                break;
            default:
                document.getElementById('admin-content').innerHTML = `
                <h2>404 Pagina no encontrada</h2> 
                `
        }
    }
}