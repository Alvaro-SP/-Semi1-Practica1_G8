import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent implements OnInit {

  @Input()
  nombre: string = ''

  @Input()
  fotos: Array<String> = []

  firsFoto:any=""

  constructor() {
   
  }

  ngOnInit(): void {
    this.firsFoto=this.fotos.shift()
    if (this.firsFoto == '') {
      this.firsFoto = "https://pbs.twimg.com/media/El1D0t0XgAAzu75.jpg"
    }
  }

  getNombre() {
    return this.nombre.split(" ").join("")
  }
}
