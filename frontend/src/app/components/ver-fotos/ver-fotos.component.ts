import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ver-fotos',
  templateUrl: './ver-fotos.component.html',
  styleUrls: ['./ver-fotos.component.css']
})
export class VerFotosComponent implements OnInit {

  cuerpo: any = []

  constructor(private backend: BackendService, private router: Router) {
    if (sessionStorage.getItem("usuario") == null) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Inicie sesion para poder entrar a su perfil!',
      })

      this.router.navigate(['login'])
    } else {
      this.backend.getFotos(sessionStorage.getItem("usuario")).subscribe(
        res => {
          var js = JSON.stringify(res)
          if (js.includes("Res")) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Inicie sesion nuevamente para poder acceder!',
            })
            sessionStorage.removeItem("usuario")
            this.router.navigate(['login'])
          } else {
            this.cuerpo = JSON.parse(js)
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
