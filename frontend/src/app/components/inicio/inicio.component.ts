import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  cuerpo: any = {
    Usuario: '',
    Nombre: '',
    Foto: ''
  }

  constructor(private router: Router, private backend: BackendService) {
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
            this.cuerpo.Usuario = data.Usuario
            this.cuerpo.Nombre = data.Nombre
            this.cuerpo.Foto = data.Foto
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

}
