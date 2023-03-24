import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-extraer-txt',
  templateUrl: './extraer-txt.component.html',
  styleUrls: ['./extraer-txt.component.css']
})
export class ExtraerTxtComponent implements OnInit {
  constructor(private backend: BackendService, private router: Router) { }

  ngOnInit(): void {
  }

  public existsFoto = false;
  public existsTexto = false;
  public foto = "";
  public texto = "";

  cuerpo: any = { 
    Foto: ''
  }

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

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
      this.foto = reader.result as string
      this.existsFoto = true
      //console.log(this.cuerpo.Foto)
    }
  }


  Registrar() {
    let auxArr = this.foto.split(",", 2)
    this.foto = auxArr[1]
    this.cuerpo.Foto = this.foto;
    this.backend.obtTxt(this.cuerpo).subscribe(
      res => {
        const resp = JSON.parse(JSON.stringify(res))
        if (resp.texto) {
          this.texto = resp.texto;
          this.existsTexto = true;
          Swal.fire({
            icon: 'success',
            title: 'Texto obtenido',
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Ha ocurrido un error',
          })
          this.cuerpo.Foto = ""
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