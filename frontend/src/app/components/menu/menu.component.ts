import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})

export class MenuComponent implements OnInit {
  chatOpen = false;
  items: any = [
    {
      message: 'Hola, soy el bot de la pagina, en que te puedo ayudar?',
      "bot": true
    }
  ];
  cuerpo: any = {
    message: '',
    id:sessionStorage.getItem("usuario")
  }
  // id = sessionStorage.getItem("usuario")
  
  
  toggleChat() {
    this.chatOpen = !this.chatOpen;
  }
  constructor(private backend: BackendService,private router: Router) {
    console.log(this.cuerpo.id)
    this.backend.chatbotmsg(this.cuerpo.id).subscribe(
      res => {
        const resp = JSON.parse(JSON.stringify(res))
          this.items = resp;
          console.log(this.items)
      }
    )

  }

  ngOnInit(): void {
  }
  
  CerrarSesion() {
    sessionStorage.removeItem("usuario")
    this.router.navigate(['login'])
  }
  
  Registrar() {
    if (this.cuerpo.message == "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor ingrese un mensaje valido para el bot ',
      })
      return
    }
    this.backend.sendmessage(this.cuerpo).subscribe(
      res => {
        const resp = JSON.parse(JSON.stringify(res))
        if (resp) {
          this.items = resp;
          console.log(this.items)
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Nombre de usuario ya existente, cree uno nuevo!',
          })
          this.cuerpo.message = ""
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
    console.log(this.cuerpo.id)
    
    console.log(this.items)

  }

}
