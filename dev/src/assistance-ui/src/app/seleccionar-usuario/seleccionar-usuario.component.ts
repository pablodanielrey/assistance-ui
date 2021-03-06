import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { NgModel } from '@angular/forms';

import { Usuario } from '../entities/usuario';
import { AssistanceService } from '../assistance.service';


@Component({
  selector: 'app-seleccionar-usuario',
  templateUrl: './seleccionar-usuario.component.html',
  styleUrls: ['./seleccionar-usuario.component.css']
})
export class SeleccionarUsuarioComponent implements OnInit {

  usuarios: any[] = [];
  busqueda:string;
  busquedaActivada: boolean = false;
  cargando: boolean = false;
  subscriptions: any[] = [];
  @Output() seleccionado: EventEmitter<Usuario> = new EventEmitter();

  constructor(public service: AssistanceService) {
  }

  ngOnInit() {
    this.cargando = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  actualizarBusqueda() : void {
    this.busquedaActivada = (this.busqueda.length > 3);
  }

  buscarUsuarios(): void {
    this.usuarios = [];
    this.busqueda = this.busqueda.replace('\.', '').trim();
    this.cargando = true;
    this.subscriptions.push(this.service.buscarUsuariosAsistencia(this.busqueda)
      .subscribe(usuarios => {
        usuarios.sort((a,b) => {
          var aFull = (a.usuario.nombre + a.usuario.apellido).toLowerCase()
          var bFull = (b.usuario.nombre + b.usuario.apellido).toLowerCase()
          if (aFull > bFull) {
            return 1
          }
          if (aFull < bFull) {
            return -1
          }
          return 0
        });
        this.usuarios = usuarios
        this.cargando = false;;
      }));
  }

  onSelected(usuario: Usuario): void {
    console.log('evento');
    this.seleccionado.emit(usuario);
  }

}
