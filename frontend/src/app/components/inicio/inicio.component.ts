import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

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

  constructor(private router: Router, private backend: BackendService, private sanitizer: DomSanitizer) {
    if (sessionStorage.getItem("usuario") == null) {
      alert("Inicie sesion para poder entrar a su perfil")
      this.router.navigate(['login'])
    } else {
      this.backend.getInfo(sessionStorage.getItem("usuario")).subscribe(
        res => {
          var js = JSON.stringify(res)
          if (js.includes("Res")) {
            alert("Inicie sesion nuevamente para poder acceder")
            sessionStorage.removeItem("usuario")
            this.router.navigate(['login'])
          } else {
            var data = JSON.parse(js)
            this.cuerpo.Usuario = data.Usuario
            this.cuerpo.Nombre = data.Nombre
            this.cuerpo.Foto = this.sanitizer.bypassSecurityTrustUrl(`data:image/png;base64, ${data.Foto}`)
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
