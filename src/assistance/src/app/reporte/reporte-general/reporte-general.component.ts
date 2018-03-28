import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReporteGeneral, RenglonReporte, Marcacion, FechaJustificada } from '../../entities/asistencia';
import { Location } from '@angular/common';

import { AssistanceService } from '../../assistance.service';

import { MatDialog, MatDialogRef } from '@angular/material';

import { DialogoEliminarFechaJustificadaComponent } from '../dialogo-eliminar-fecha-justificada/dialogo-eliminar-fecha-justificada.component';


@Component({
  selector: 'app-reporte-general',
  templateUrl: './reporte-general.component.html',
  styleUrls: ['./reporte-general.component.css']
})
export class ReporteGeneralComponent implements OnInit {

  subscriptions: any[] = [];
  fecha: Date;
  ids: string[];
  reportes: Array<ReporteGeneral> = [];
  eliminarJustificacionDialogRef: MatDialogRef<DialogoEliminarFechaJustificadaComponent>;

  constructor(private route: ActivatedRoute,
              private service: AssistanceService,
              public dialog: MatDialog,
              private location: Location) { }

  ngOnInit() {
    let params = this.route.snapshot.queryParams;
    this.ids = params["ids"];
    this.ids = (typeof this.ids === "string") ? [this.ids] : this.ids;
    this.fecha = new Date(params['fecha']) || null;
    this.generarReporte();

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  volver() {
    this.location.back();
  }
  generarReporte() {
    this.reportes = [];
    this.subscriptions.push(this.service.generarReporteGeneral(this.ids, this.fecha)
    .subscribe(r => {
      this.reportes = r;
      console.log(r);
    }));
  }

  obtenerHoraEntrada(r: RenglonReporte) {
    if (r.horario) {
      let e = new Date(r.fecha); e.setSeconds(0); e.setMinutes(0); e.setHours(0);
      e.setSeconds(r.horario.hora_entrada)
      return e;
    }
  }

  obtenerHoraSalida(r: RenglonReporte) {
    if (r.horario) {
      let s = new Date(r.fecha); s.setSeconds(0); s.setMinutes(0); s.setHours(0);
      s.setSeconds(r.horario.hora_salida)
      return s;
    }
  }

  obtenerMarcacion(m: Marcacion): Date {
    if (m == null) {
      return null
    }
    return m.marcacion
  }

  obtenerHorasTrabajadas(r:RenglonReporte) {
    let segundos = r.cantidad_horas_trabajadas;
    let min = Math.trunc((segundos / 60) % 60);
    let hs = Math.trunc((segundos / 60) / 60);
    return String(hs) + ":" + String(min);
  }

  obtenerMarcacionesIndividuales(r: RenglonReporte): string {
    let marcaciones = ''
    r.marcaciones.forEach(m => marcaciones = marcaciones + '<br>' + new Date(m.marcacion));
    return marcaciones;
  }

  eliminarJustificacion(justificacion:any, uid: any) {
    this.eliminarJustificacionDialogRef = this.dialog.open(DialogoEliminarFechaJustificadaComponent, {data: justificacion});
    this.eliminarJustificacionDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subscriptions.push(this.service.eliminarFechaJustificada(uid, justificacion.id)
        .subscribe(r => {
          this.clearJustificaciones(r);
        }));
      }
    });
  }

  clearJustificaciones(jid: string) {
    this.reportes.forEach(rep => rep.reportes.forEach(r => r.justificaciones = this.eliminarJustificacionDeRenglon(r.justificaciones, jid)));
  }

  eliminarJustificacionDeRenglon(justificaciones: FechaJustificada[], jid): Array<any> {
    return justificaciones.filter(j => j.id != jid);;
  }

}