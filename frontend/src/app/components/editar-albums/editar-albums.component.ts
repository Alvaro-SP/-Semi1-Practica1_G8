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
    this.cargarInfo();
   }

   cargarInfo(){
    this.backend.getAlbums(sessionStorage.getItem("usuario")).subscribe(
      res => {
        this.jsalbums = res
      },
      err => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Ocurrio un Error!',
        })
      }
    )
   }

  ngOnInit(): void {
  }

  cuerpo: any = {
    Id: '',
    Album: '',
    Lastalbum:''
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

    var c = 0
    this.jsalbums.forEach( () => {
      if (this.jsalbums[c].Id == this.cuerpo.Id){
        this.cuerpo.Lastalbum = this.jsalbums[c].Nombre
      }
      c++
    });

    this.backend.eliminaAlbum(sessionStorage.getItem('usuario') , this.cuerpo.Lastalbum).subscribe(
      res => {
        const resp = JSON.parse(JSON.stringify(res))
        if (resp.Res) {
          
          Swal.fire({
            icon: 'success',
            text: 'Se ha eliminado el album correctamente',
          })
          this.cargarInfo()
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Este album no existe'
          })
          this.cuerpo.Foto = ""
          this.cuerpo.Album = ""
          this.cuerpo.Lastalbum = ""
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
    var c = 0
    this.jsalbums.forEach( () => {
      if (this.jsalbums[c].Id == this.cuerpo.Id){
        this.cuerpo.Lastalbum = this.jsalbums[c].Nombre
      }
      c++
    });

    if (this.cuerpo.Id == "" || this.cuerpo.Album == "" || this.cuerpo.Lastalbum == "") {
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
          this.cargarInfo()
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Este album no existe'
          })
          this.cuerpo.Foto = ""
          this.cuerpo.Album = ""
          this.cuerpo.Lastalbum = ""
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
 