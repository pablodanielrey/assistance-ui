import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Justificacion, FechaJustificada } from '../../entities/asistencia';
import { Usuario } from '../../entities/usuario';
import { AssistanceService } from '../../assistance.service';


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


  constructor(private route: ActivatedRoute,
              private location: Location,
              private service: AssistanceService) { }

  ngOnInit() {
    let params = this.route.snapshot.paramMap;
    let paramsQ = this.route.snapshot.queryParamMap;

    this.usuario_id = params.get('uid');

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
      }));
  }

  buscarJustificaciones() {
    this.justificaciones = [];
    this.subscriptions.push(this.service.buscarJustificaciones()
      .subscribe(justificaciones => {
        this.justificaciones = justificaciones;
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

  justificar() {
    let fj=  new FechaJustificada({});
    fj.usuario_id = this.usuario_id;
    fj.justificacion = this.justificacion;
    if (this.seleccionFecha == 'simple') {
      this.fecha = this.setInit(this.fecha);
      fj.fechaInicio = this.fecha;
      fj.fechaFin = null;
    } else {
      fj.fechaInicio = this.setInit(this.fechaInicio);
      fj.fechaFin = this.setInit(this.fechaFin);
    }

    this.subscriptions.push(this.service.justificar(fj)
      .subscribe(r => {
        console.log(r);
      }));

  }
}