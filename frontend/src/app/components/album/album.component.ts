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
  fotos: Array<any> = []

  firsFoto:any=""

  constructor() {
   
  }

  ngOnInit(): void {
    this.firsFoto=this.fotos.shift()
  }

  getNombre() {
    return this.nombre.split(" ").join("")
  }
}
