import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';

import Swal from 'sweetalert2'

@Component({
  selector: 'app-subir-foto',
  templateUrl: './subir-foto.component.html',
  styleUrls: ['./subir-foto.component.css']
})
export class SubirFotoComponent implements OnInit {

  constructor(private backend: BackendService, private router: Router) { 
    if (sessionStorage.getItem("usuario") == null) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Inicie sesion para poder entrar a su perfil!',
      })
      this.router.navigate(['login'])
    }
   }

  ngOnInit(): void {
  }

  /*
  cuerpo: any = {
    Foto: '',
    Album: '',
    NamePhoto:'',
    Lastusuario: sessionStorage.getItem("usuario")
  }
  */

  cuerpo: any = {
    Foto: '',
    Album: '',
    Descripcion:'',
    Lastusuario: sessionStorage.getItem("usuario")
  }

  public showWebcam = false;
  public webcamImage: any = null;
  public hayFoto = false;
  habilitarCreacion = false;

  //selectAlbum:string = ''

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  /*public habilitaCreacion(): void {
    this.habilitarCreacion = !this.habilitarCreacion;
  }*/



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

  subir(){
    //console.log(this.cuerpo.Foto)
    //this.cuerpo.Album = this.selectAlbum
    //if (this.cuerpo.Foto == "" || this.cuerpo.Album == "" || this.cuerpo.NamePhoto == "") {
    if (this.cuerpo.Foto == "" || this.cuerpo.Descripcion == "" || this.cuerpo.NamePhoto == "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Complete todos los campos!',
      })
      return
    } 
    let backupFoto=this.cuerpo.Foto
    try{   
      let auxArr = this.cuerpo.Foto.split(",", 2)
      this.cuerpo.Foto = auxArr[1]
    }catch{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No ha cargado una imagen!',
      })
      return
    }

    console.log(this.cuerpo)
    this.backend.subirFoto(this.cuerpo).subscribe(
      res => {
        const resp = JSON.parse(JSON.stringify(res))
        if (resp.Res) {
          
          Swal.fire({
            icon: 'success',
            text: 'Se ha subido la fotografía al album correctamente',
          })

          this.router.navigate(['verFotos'])
        } else {
          Swal.fire({
            icon: 'error',
            text: 'Esta fotografía ya existe en este album!'
          })
          
        }
        this.cuerpo.Foto=backupFoto
  
      },
      err => {
        Swal.fire({
          icon: 'error',
          text: 'Ocurrio un error'
        })
      }
    )

  }
}
 