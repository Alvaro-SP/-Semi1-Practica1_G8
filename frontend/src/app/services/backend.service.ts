import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http:HttpClient) { }
  URL:string="http://localhost:4000"

  Login(cuerpo:any){
    return this.http.post(`${this.URL}/login`, cuerpo);
  }
}
