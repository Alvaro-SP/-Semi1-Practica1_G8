import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient) { }
  URL: string = "http://localhost:4000"

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

  getAlbums() {
    return this.http.get(`${this.URL}/getAlbums`);
  }
}
