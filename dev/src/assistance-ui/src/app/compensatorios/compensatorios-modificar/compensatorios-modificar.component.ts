import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { BehaviorSubject } from 'rxjs';

import { Compensatorio } from '../../entities/asistencia';
import { AssistanceService } from '../../assistance.service';

@Component({
  selector: 'app-compensatorios-modificar',
  templateUrl: './compensatorios-modificar.component.html',
  styleUrls: ['./compensatorios-modificar.component.css']
})
export class CompensatoriosModificarComponent implements OnInit {
  usuario_id: string = null;
  cargando: boolean = false;
  info: any = null;
  back: string ='/sistema/compensatorios/inicial';
  subscriptions: any[] = [];
  compensatorios : BehaviorSubject<Compensatorio[]> = new BehaviorSubject<Compensatorio[]>([]);

  constructor(private service: AssistanceService,
              private router: Router,
              private location: Location,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.cargando = true;
    let params = this.route.snapshot.paramMap;
    this.usuario_id = params.get('uid');
    this.subscriptions.push(this.service.obtenerCompensatorios(this.usuario_id).subscribe(r => {
      this.cargando = false;
      this.info = {
        usuario: r.usuario,
        cantidad: r.cantidad
      };
      let comp = r.compensatorios;
      this.compensatorios.next(comp);
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  volver() {
    this.location.back();
  }

}
