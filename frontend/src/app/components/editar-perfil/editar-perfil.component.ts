import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { DomSanitizer } from '@angular/platform-browser';

import Swal from 'sweetalert2'


@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css']
})
export class EditarPerfilComponent implements OnInit {

  constructor(private backend: BackendService, private router: Router, private sanitizer: DomSanitizer) { 
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

  ngOnInit(): void {
    
  }
  cuerpo: any = {
    Usuario: '',
    Nombre: '',
    Password: '',
    Foto: '',
    Lastusuario: ''
  }
  

  confirmPass = ''
  User = ""
  public showWebcam = false;
  public webcamImage: any = null;
  public cambiarFoto = false;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public cFoto(): void {
    this.cambiarFoto = !this.cambiarFoto;
  }

  imageSelected?: Blob
  @ViewChild('ImageInput', { static: false }) ImageInput!: ElementRef;
  img: string = ''



  onImageUpload() {
    this.imageSelected = this.ImageInput.nativeElement.files[0]
    this.convertToBase64()
  }

  convertToBase64() {
    let reader = new FileReader();
    reader.readAsDataURL(this.imageSelected as Blob);
    reader.onloadend = () => {
      this.cuerpo.Foto = reader.result as string
      //console.log(this.cuerpo.Foto)
    }
  }

  triggerSnapshot(): void {
    this.trigger.next();
    this.showWebcam = !this.showWebcam
  }
  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.cuerpo.Foto = this.webcamImage.imageAsDataUrl
    //console.log(this.cuerpo.Foto)
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }


  Registrar() {
   
    this.cuerpo.Lastusuario = sessionStorage.getItem("usuario")
    Swal.fire({
      title: 'Ingresa tu contraseña',
      input: 'password',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      showConfirmButton: true,
      preConfirm: async (pass) => {
        this.cuerpo.Password = pass
        if (this.cuerpo.Usuario == "" || this.cuerpo.Nombre == "" || this.cuerpo.Password == "" || this.cuerpo.Foto == "") {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Complete todos los campos!',
          })
          return
        }else{
          this.User = this.cuerpo.Usuarios
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then(() => {
      let backupFoto=this.cuerpo.Foto
      try{
        if (!this.cuerpo.Foto.includes("http")){
          let auxArr = this.cuerpo.Foto.split(",", 2)
          this.cuerpo.Foto = auxArr[1]
        }
        
      }catch{
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No ha cargado una imagen!',
        })
        return
      }
      console.log(this.cuerpo)
      this.backend.Editar(this.cuerpo).subscribe(
        res => {
          const resp = JSON.parse(JSON.stringify(res))
          if (resp.Res) {
            sessionStorage.removeItem("usuario")
            sessionStorage.setItem("usuario", this.cuerpo.Usuario)
            Swal.fire({
              icon: 'success',
              text: 'Información actualizada con éxito',
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Contraseña erronea',
            })
            this.cuerpo.Password = ""
          }
          this.cuerpo.Foto=backupFoto
        },
        err => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Ocurrió un error!',
          })
        }
      )

    })

    
  }
}