import {Component, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent implements OnInit {
  constructor(private messageService: MessageService) {}

  ngOnInit(): void {}
}
