import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-detalle-foto',
  templateUrl: './detalle-foto.component.html',
  styleUrls: ['./detalle-foto.component.css']
})
export class DetalleFotoComponent implements OnInit {

  cuerpo: any = {
    Id: '',
    Nombre: '',
    Foto: '',
    Descripcion: ''
  }

  traducirDesc: any = {
    Idioma: '',
    Descripcion: ''
  }

  Traduccion = '';

  constructor(private backend: BackendService, private ruta: ActivatedRoute, private router: Router) {
    if (sessionStorage.getItem("usuario") == null) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Inicie sesion para entrar a su perfil!',
      })
      this.router.navigate(['login'])
    } else {
      this.backend.getInfo(sessionStorage.getItem("usuario")).subscribe(
        res => {
          var js = JSON.stringify(res)
          if (js.includes("Res")) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Inicie sesion nuevamente!',
            })
            sessionStorage.removeItem("usuario")
            this.router.navigate(['login'])
          } else {
            var data = JSON.parse(js)
            this.cuerpo.Id = data.Id
            this.cuerpo.Nombre = data.Nombre
            this.cuerpo.Foto = data.Foto
            this.cuerpo.Descripcion = data.Descripcion
          }
        },
        err => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Ocurrio un error!',
          })
        }
      )
    }
  }

  ngOnInit(): void {
  }

  traducir() {

    if (this.traducirDesc.Idioma == '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Seleccione un idioma para la traduccion!',
      })
      return
    }
    this.traducirDesc.Descripcion = this.cuerpo.Descripcion
    this.backend.traducirDescripcion(this.traducirDesc).subscribe(
      res => {
        let js = JSON.stringify(res)
        if (js.includes("Res")) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Algo salio mal con esta traduccion!',
          })
          this.router.navigate(['verFotos'])
        } else {
          let data = JSON.parse(js)
          this.cuerpo.Id = data.Id
          this.cuerpo.Nombre = data.Nombre
          this.cuerpo.Foto = data.Foto
          this.cuerpo.Descripcion = data.Descripcion
        }
      },
      err => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Ocurrio un error!',
        })
      }
    )
  }
}

