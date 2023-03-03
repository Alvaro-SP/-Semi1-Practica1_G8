import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }
  URL: string = "http://BalanceadorSemi1P1-1838550676.us-east-2.elb.amazonaws.com"

  Login(cuerpo: any) {
    return this.http.post(`${this.URL}/login`, cuerpo);
  }

  Registro(cuerpo: any) {
    return this.http.post(`${this.URL}/registro`, cuerpo);
  }

  getInfo(usuario: any) {
    return this.http.get(`${this.URL}/info/${usuario}`);
  }

  getFotos(usuario: any) {
    return this.http.get(`${this.URL}/verFotos/${usuario}`);
  }

  Editar(cuerpo: any) {
    return this.http.put(`${this.URL}/actualizaInfo`, cuerpo);
  }

  getAlbums(usuario: any) {
    return this.http.get(`${this.URL}/getAlbums/${usuario}`);
  }

  crearAlbum(cuerpo: any) {
    return this.http.post(`${this.URL}/crearAlbum`, cuerpo);
  }

  subirFoto(cuerpo: any) {
    return this.http.put(`${this.URL}/subirFoto`, cuerpo);
  }

  modificaAlbum(cuerpo: any) {
    return this.http.put(`${this.URL}/modificaAlbum`, cuerpo);
  }

  eliminaAlbum(usuario: any, namealbum: any) {
    return this.http.delete(`${this.URL}/eliminaAlbum/${usuario}/${namealbum}`);
  }
}
