
import {map} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Justificacion, FechaJustificada } from '../../entities/asistencia';
import { Usuario } from '../../entities/usuario';
import { AssistanceService } from '../../assistance.service';
import { NotificacionesService } from '../../notificaciones.service';


@Component({
  selector: 'app-justificacion-personal',
  templateUrl: './justificacion-personal.component.html',
  styleUrls: ['./justificacion-personal.component.css']
})
export class JustificacionPersonalComponent implements OnInit {

  info: any;
  fecha: Date;
  fechaInicio: Date;
  fechaFin: Date;
  usuario_id: string;
  justificaciones: Justificacion[];
  subscriptions: any[] = [];
  seleccionFecha: string = 'simple';
  justificacion: Justificacion = null;
  usuario: Usuario;
  cargando: boolean = false;
  cargandoJustificaciones: boolean = false
  cargandoUsuario: boolean = false;


  constructor(private route: ActivatedRoute,
              private location: Location,
              private notificaciones: NotificacionesService,
              private service: AssistanceService) { }

  ngOnInit() {
    let params = this.route.snapshot.paramMap;
    let paramsQ = this.route.snapshot.queryParamMap;

    this.usuario_id = params.get('uid');
    this.cargando = true;
    this.cargandoUsuario = true;
    this.cargandoJustificaciones = true;

    let fecha_str = paramsQ.get('fecha');
    this.fecha = (fecha_str == null)? new Date() : new Date(fecha_str);
    this.fechaInicio = new Date(this.fecha);
    this.fechaFin = new Date(this.fecha);
    this.buscarUsuario()

    this.buscarJustificaciones();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  buscarUsuario() {
    this.subscriptions.push(this.service.buscarUsuario(this.usuario_id)
      .subscribe(info => {
        this.usuario = info.usuario;
        this.cargandoUsuario = false;
        this.cargando = this.cargandoUsuario || this.cargandoJustificaciones;
      }));
  }

  buscarJustificaciones() {
    this.justificaciones = [];
    this.subscriptions.push(this.service.buscarJustificaciones().pipe(
      map(justificaciones => justificaciones.filter(j => !j.general ? !j.general : false)))
      .subscribe(justificaciones => {
        justificaciones.sort((a,b):number => {
          if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) {
            return 1;
          }
          if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) {
            return -1;
          }
          return 0
        });
        this.justificaciones = justificaciones;
        this.cargandoJustificaciones = false;
        this.cargando = this.cargandoUsuario || this.cargandoJustificaciones;
      }));
  }

  seleccionarJustificacion(j:Justificacion) {
    this.justificacion = j;
  }

  setInit(fecha:Date): Date {
    fecha.setHours(0);
    fecha.setMinutes(0);
    fecha.setSeconds(0);
    fecha.setMilliseconds(0);
    return fecha;
  }

  volver() {
    this.location.back();
  }

  obtenerDias(): number {
    let dt1 = new Date(this.fechaInicio);
    let dt2 = new Date(this.fechaFin);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
  }

  justificar() {
    let fj=  new FechaJustificada({});
    fj.usuario_id = this.usuario_id;
    fj.justificacion = this.justificacion;
    if (this.seleccionFecha == 'simple') {
      this.fecha = this.setInit(this.fecha);
      fj.fecha_inicio = this.fecha;
      fj.fecha_fin = null;
    } else {
      fj.fecha_inicio = this.setInit(this.fechaInicio);
      fj.fecha_fin = this.setInit(this.fechaFin);
    }

    this.subscriptions.push(this.service.justificar(fj)
      .subscribe(r => {
        let fechaStr = (this.seleccionFecha == 'simple') ? this.fecha.toLocaleDateString() : this.fechaInicio.toLocaleDateString() + " - " + this.fechaFin.toLocaleDateString();
        this.notificaciones.show("Justificacion generada: " + this.justificacion.nombre + ", para la fecha: " + fechaStr);
        this.volver();
      }));

  }
}
