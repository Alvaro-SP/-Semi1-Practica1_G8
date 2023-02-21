import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { DomSanitizer } from '@angular/platform-browser';

import Swal from 'sweetalert2'

@Component({
  selector: 'app-editar-albums',
  templateUrl: './editar-albums.component.html',
  styleUrls: ['./editar-albums.component.css']
})
export class EditarAlbumsComponent implements OnInit {

  constructor(private backend: BackendService, private router: Router) { 
    this.backend.getAlbums().subscribe(
      res => {
        this.jsalbums = res
      },
      err => {
        alert("Ocurrio un error")
      }
    )
   }

  ngOnInit(): void {
  }

  cuerpo: any = {
    Id: '',
    Album: ''
  }
  

  jsalbums:any
  albums = []
  habilitarCreacion = false;

  selectAlbum:string = ''


  public habilitaCreacion(): void {
    this.habilitarCreacion = !this.habilitarCreacion;
  }


  elimina(){
    if (this.cuerpo.Id == "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Seleccione un album a eliminar!',
      })
      return
    }


    this.backend.eliminaAlbum(this.cuerpo.Id).subscribe(
      res => {
        const resp = JSON.parse(JSON.stringify(res))
        if (resp.Res) {
          
          Swal.fire({
            icon: 'success',
            text: 'Se ha eliminado el album correctamente',
          })
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Este album no existe'
          })
          this.cuerpo.Foto = ""
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

  subir(){
    if (this.cuerpo.Id == "" || this.cuerpo.Album == "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Complete todos los campos!',
      })
      return
    }


    this.backend.modificaAlbum(this.cuerpo).subscribe(
      res => {
        const resp = JSON.parse(JSON.stringify(res))
        if (resp.Res) {
          
          Swal.fire({
            icon: 'success',
            text: 'Se ha modificado el album correctamente',
          })
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Este album no existe'
          })
          this.cuerpo.Foto = ""
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
 