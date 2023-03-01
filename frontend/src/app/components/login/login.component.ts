import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private backend: BackendService, private router: Router) { }

  ngOnInit(): void {
  }

  cuerpo: any = {
    Usuario: '',
    Password: ''
  }

  Login() {
    if (this.cuerpo.Usuario == "" || this.cuerpo.Password == "") {
      alert("Complete todos los campos")
      return;
    }
    this.backend.Login(this.cuerpo).subscribe(
      
      res => {
        const resp = JSON.parse(JSON.stringify(res))
        console.log(resp)
        if (resp.Res) {
          sessionStorage.setItem("usuario", this.cuerpo.Usuario)
          this.cuerpo.Usuario = ""
          this.cuerpo.Password = ""
          this.router.navigate(['inicio'])
        } else {
          alert("Usuario o Contraseña Incorrecta")
          this.cuerpo.Usuario = ""
          this.cuerpo.Password = ""
        }
      },
      err => {
        alert("Ocurrio un error :(")
        console.log(err)
      }
    )
  }

}
