import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Swal from 'sweetalert2'
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
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Complete todos los campos!',
      })
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
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Usuario o Contraseña Incorrecta!',
          })
          this.cuerpo.Usuario = ""
          this.cuerpo.Password = ""
        }
      },
      err => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Ocurrio un error :(',
        })
        console.log(err)
      }
    )
  }

}
