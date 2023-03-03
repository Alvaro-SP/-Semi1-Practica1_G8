import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';

import Swal from 'sweetalert2'
import { EditarAlbumsComponent } from '../editar-albums/editar-albums.component';

@Component({
  selector: 'app-crear-album',
  templateUrl: './crear-album.component.html',
  styleUrls: ['./crear-album.component.css']
})
export class CrearAlbumComponent implements OnInit {

  constructor(private backend: BackendService,private mm:EditarAlbumsComponent ) { 
    this.cuerpo.Lastusuario = sessionStorage.getItem('usuario')
  }

  ngOnInit(): void {
  }

  cuerpo: any = {
    Album: '',
    Lastusuario: ''
  }

  cAlbum() {
    if (this.cuerpo.Album == "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Complete todos los campos!',
      })
      return
    }

    this.backend.crearAlbum(this.cuerpo).subscribe(
      res => {
        const resp = JSON.parse(JSON.stringify(res))
        if (resp.Res) {
          Swal.fire({
            icon: 'success',
            text: 'Se ha creado el album correctamente',
          })
          this.mm.cargarInfo()
          this.mm.habilitarCreacion=false
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Este album ya existente!'
          })
          this.cuerpo.Album = ""
        }
      },
      err => {
        Swal.fire({
          icon: 'error',
          text: 'Ocurrio un error'
        })
      }
    )
  }

}
