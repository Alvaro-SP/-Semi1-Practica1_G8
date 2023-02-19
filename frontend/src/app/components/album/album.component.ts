import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

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


  constructor(private sanitizer: DomSanitizer) {
    for (let i = 0; i < this.fotos.length; i++) {
      this.fotos[i] = this.sanitizer.bypassSecurityTrustUrl(`data:image/png;base64, ${this.fotos[i]}`)
    }
  }

  ngOnInit(): void {
  }

}
