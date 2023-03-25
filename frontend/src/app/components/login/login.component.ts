import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';
import { WebcamImage } from 'ngx-webcam';
import Swal from 'sweetalert2'
import { Observable, Subject } from 'rxjs';
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
    Password: '',
    Foto: ''
  }

  //Fotografia
  public showWebcam = false;
  public webcamImage: any = null;
  public existsFoto = false;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  triggerSnapshot(): void {
    this.trigger.next();
    this.showWebcam = !this.showWebcam
  }
  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.existsFoto = true
    this.cuerpo.Foto = this.webcamImage.imageAsDataUrl
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  imageSelected?: Blob
  @ViewChild('ImageInput', { static: false }) ImageInput!: ElementRef;
  img: string = ''

  Login() {
    if (this.cuerpo.Usuario == "" || (this.cuerpo.Password == "" && this.cuerpo.Foto == "")) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Complete todos los campos!',
      })
      return;
    }
    if (this.cuerpo.Foto != '') {
      let auxArr = this.cuerpo.Foto.split(",", 2)
      this.cuerpo.Foto = auxArr[1]
    }

    this.backend.Login(this.cuerpo).subscribe(

      res => {
        const resp = JSON.parse(JSON.stringify(res))
        console.log(resp)
        if (resp.Res) {

          sessionStorage.setItem("usuario", this.cuerpo.Usuario)
          this.router.navigate(['inicio'])
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Credenciales incorrectas!',
          })
          this.cuerpo.Usuario = ""
          this.cuerpo.Password = ""
          this.cuerpo.Foto = ""
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
