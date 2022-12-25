import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { ChartConfiguration } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';
import { JoyrideService } from 'ngx-joyride';
import { JoyrideOptions } from 'ngx-joyride/lib/models/joyride-options.class';
import { Preferences } from '@capacitor/preferences'
import { ProfileModalPage } from '../profile-modal/profile-modal.page';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild(BaseChartDirective) 
  chartCanvas!: BaseChartDirective;
  iOSMode: boolean = this.platform.is('ios');
  chartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    scales: {
      r: {
        max: 5,
        min: 0,
        angleLines: {
          color: 'rgba(255, 255, 255, .5)'
        },
        beginAtZero: true,
        ticks: { 
          stepSize: 1, 
          //backdropPadding: 12, 
          //padding: 10,
          showLabelBackdrop: false,
          color: 'rgba(255, 255, 255, 1)',
          font: { size: 16},
          count: 6,
        },
        pointLabels: {
          font: { size: 18},
          borderRadius: 20,
          color: 'rgba(255, 255, 255, 1)'
        },
        grid: {
          circular: true,
          tickColor: 'rgba(255, 255, 255, .3)',
          color: 'rgba(255, 255, 255, .3)',
        },
    
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            let label1 = tooltipItem.dataset.label.split(' ')[0];
            let label2 = tooltipItem.dataset.label.split(' ').slice(1, -1);
            let percentLabel = tooltipItem.dataset.label.split(' ').pop();
            return [label1, label2, percentLabel]
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0)',
        bodyFont: {
          size: 10,
        },
        bodyAlign: 'center',
        cornerRadius: {
          topLeft: 20,
          bottomLeft: 20,
          topRight: 20,
          bottomRight: 20
        },
        displayColors: false,
        padding: {
          top: 4
        },
        bodyColor: 'rgba(250, 250, 250, .6)',
        titleAlign: 'center',
        //titleMarginBottom: 16,
        titleSpacing: 8,
        xAlign: 'center',
        yAlign: 'center',
        enabled: true,
        bodySpacing: 4,
        usePointStyle: true,
        position: 'average',
        caretSize: 0,
      },
      legend: {
        display: true,
        position:'bottom',
        align: 'center',
        labels: {
          color: 'rgba(255, 255, 255, 1)',
          textAlign: 'center',
          boxHeight: 20,
          boxWidth: 20,
          useBorderRadius: true,
          borderRadius: 10
        }
      }
    }
  };
  
  chartDatasets: ChartConfiguration<'radar'>['data']['datasets'] = [
    {
      data: [0, 1, 2, 3, 2, 4, 2, 1, 5, 4], 
      label: 'Tanzania Kokoa Kamili 70%',
      pointHoverRadius: 50,       
      tension: .24
    }
  ];
    
  labels: Array<string> = [
    'Cacao',
    'Caramel',
    'Nutty',
    'Floral',
    'Earthy',
    'Spicy',
    'Vegetal',
    'Dairy',
    'Sour Fruit',
    'Sweet Fruit'
  ];

  tourOptions: JoyrideOptions = {
    steps: [
      'step1', //mainChart
      'step2', //add profile
      'step3', //reset
    ],
    themeColor: '',
  }

  stepContent: Array<string> = [
    `This spider chart will display your flavor profiles. \n
    Tap the points for details, & tap the origin to toggle it on/off`,
    'click here to add your new flavor profile',
    'reset the the chart to start over'
  ];

  constructor(private modalCtrl: ModalController, 
              private alertCtrl: AlertController, 
              private platform: Platform,
              private joyrideService: JoyrideService) {}

  async ngOnInit() {
    const introStatus: string = await this.getIntroductionStatus();
    setTimeout(() => introStatus === 'false' && this.startTour(), 500);
  }

  startTour() {
    this.joyrideService.startTour(this.tourOptions).subscribe(() => this.setIntroductionStatus());
  }

  async setIntroductionStatus() {
    await Preferences.set({key: 'introCompleted', value: 'true'});
  }

  async getIntroductionStatus(): Promise<string> {
    const { value } = await Preferences.get({key: 'introCompleted'});
    return value ?? 'false';
  }

  async resetChart() {
    const alert = await this.alertCtrl.create({
      header: 'Reset Chart',
      message: 'Are you sure you want to reset the tasting chart?',
      buttons: [{
        text: 'No, Cancel',
        role: 'cancel'
      }, {
        text: 'Yes, Reset',
        role: 'destructive',
        handler: () => {
          this.chartDatasets = [];
        this.chartCanvas.chart?.update();
        }
      }]
    });
    await alert.present();
  }

  async presentProfileModal() {
    const screenHeight: number = this.platform.height();
    const screenWidth: number = this.platform.width();
    let breakpoint: number;
    if (screenWidth < 576) breakpoint = (this.iOSMode ? 515 : 433) / screenHeight;
    else breakpoint = (this.iOSMode ? 294 : 265) / screenHeight;
    const modal = await this.modalCtrl.create({
      component: ProfileModalPage,
      breakpoints: [0,  breakpoint],
      initialBreakpoint: breakpoint,
      handle: true,
      handleBehavior: 'cycle',
      backdropDismiss: false
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) this.addDatasets(data);
  }

  addDatasets(profile: any) {
    let data: Array<number> = []
    Object.values(profile).slice(2).forEach((p: any) => data.push(+p));
    const newDataset = {
      data,
      label: `${profile.origin} ${+profile.percent}%`,
      pointHoverRadius: 50,
      tension: .24
    };
    this.chartDatasets.push(newDataset);
    this.chartCanvas.chart?.data?.datasets?.push(newDataset);
    this.chartCanvas.chart?.update();
  }
}