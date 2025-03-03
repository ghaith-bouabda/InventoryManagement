import { Component } from '@angular/core';
import { ChartOptions, ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent {
  // Bar Chart
  public barChartOptions: ChartOptions = {
    responsive: true
  };
  public barChartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  public barChartData: ChartData<'bar'> = {
    labels: this.barChartLabels,
    datasets: [
      { data: [10, 20, 30, 40, 50, 60], label: 'Sales' }
    ]
  };
  public barChartType: ChartType = 'bar';

  // Pie Chart
  public pieChartData: ChartData<'pie'> = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [{ data: [30, 50, 20] }]
  };
  public pieChartType: ChartType = 'pie';
}
