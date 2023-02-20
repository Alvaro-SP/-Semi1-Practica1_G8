import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { DomSanitizer } from '@angular/platform-browser';

import Swal from 'sweetalert2'

@Component({
  selector: 'app-subir-foto',
  templateUrl: './subir-foto.component.html',
  styleUrls: ['./subir-foto.component.css']
})
export class SubirFotoComponent implements OnInit {

  constructor(private backend: BackendService, private router: Router) { 
    this.backend.getAlbums().subscribe(
      res => {
        this.jsalbums = res
      },
      err => {
        alert("Ocurrio un error")
      }
    )
   }

  ngOnInit(): void {
  }

  cuerpo: any = {
    Usuario: '',
    Nombre: '',
    Password: '',
    Foto: ''
  }
  

  confirmPass = ''
  jsalbums:any
  albums = []
  public showWebcam = false;
  public webcamImage: any = null;
  public hayFoto = false;
  habilitarCreacion = false;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public habilitaCreacion(): void {
    this.habilitarCreacion = !this.habilitarCreacion;
  }



  imageSelected?: Blob
  @ViewChild('ImageInput', { static: false }) ImageInput!: ElementRef;
  img: string = ''



  onImageUpload() {
    this.imageSelected = this.ImageInput.nativeElement.files[0]
    this.convertToBase64()
    this.hayFoto = true;
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
    this.hayFoto = true;
    //console.log(this.cuerpo.Foto)
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

}
 