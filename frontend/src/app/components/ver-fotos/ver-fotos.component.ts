import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-ver-fotos',
  templateUrl: './ver-fotos.component.html',
  styleUrls: ['./ver-fotos.component.css']
})
export class VerFotosComponent implements OnInit {

  cuerpo: any = []

  constructor(private backend: BackendService, private router: Router) {
    if (sessionStorage.getItem("usuario") == null) {
      alert("Inicie sesion para poder entrar a su perfil")
      this.router.navigate(['login'])
    } else {
      this.backend.getFotos(sessionStorage.getItem("usuario")).subscribe(
        res => {
          var js = JSON.stringify(res)
          if (js.includes("Res")) {
            alert("Inicie sesion nuevamente para poder acceder")
            sessionStorage.removeItem("usuario")
            this.router.navigate(['login'])
          } else {
            this.cuerpo = JSON.parse(js)
          }
        },
        err => {
          alert("Ocurrio un error")
        }
      )
    }
  }

  ngOnInit(): void {
  }

}
