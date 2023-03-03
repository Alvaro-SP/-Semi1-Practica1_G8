import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { VerFotosComponent } from './components/ver-fotos/ver-fotos.component';
import { EditarPerfilComponent } from './components/editar-perfil/editar-perfil.component';
import { SubirFotoComponent } from './components/subir-foto/subir-foto.component';
import { CrearAlbumComponent } from './components/crear-album/crear-album.component';
import { EditarAlbumsComponent } from './components/editar-albums/editar-albums.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
  , {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registro',
    component: RegistroComponent
  },
  {
    path: 'inicio',
    component: InicioComponent
  },
  {
    path: 'verFotos',
    component: VerFotosComponent
  },
  {
    path: 'editarPerfil',
    component: EditarPerfilComponent
  },
  {
    path: 'subirFoto',
    component: SubirFotoComponent
  },
  {
    path: 'crearAlbum',
    component: CrearAlbumComponent
  },{
    path: 'editarAlbums',
    component: EditarAlbumsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
