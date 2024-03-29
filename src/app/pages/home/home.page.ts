import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { ChartConfiguration } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';
import { JoyrideService } from 'ngx-joyride';
import { JoyrideOptions } from 'ngx-joyride/lib/models/joyride-options.class';
import { Preferences } from '@capacitor/preferences';
import { Share, ShareOptions, CanShareResult, ShareResult} from '@capacitor/share';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild(BaseChartDirective) 
  public chartCanvas!: BaseChartDirective;

  private truncateText = (text: string) => text.substring(0, 11) + '...';
  private iOSMode: boolean = this.platform.is('ios');

  public chartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    scales: {
      r: {
        max: 5,
        min: 0,
        alignToPixels: true,
        angleLines: {
          color: 'rgba(255, 255, 255, .5)'
        },
        beginAtZero: true,
        ticks: { 
          stepSize: 1, 
          showLabelBackdrop: false,
          color: 'rgba(255, 255, 255, 1)',
          font: { size: 16},
          count: 6,
        },
        pointLabels: {
          font: { size: 18},
          borderRadius: 20,
          color: 'rgba(255, 255, 255, 1)',
          callback: (label, index) => {
            return (this.platform.isPortrait()) ? label.split(' ')[0] : label;
          }
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
          title: ((tooltipItem: any) => { return tooltipItem[0].label.split(' ')[0] 
                     /* console.log(tooltipItem)
            let {label}: { label:string } = tooltipItem[0];
            console.log('label', label);
            const words: string[] = label.split(' ');
            words.pop();
            return (words.length === 1) 
              ? words[0]
              : `${words[0]} ${words[1]}` */
          }),
          label: (tooltipItem: any) => {  
            //console.log(tooltipItem)  
            const {dataIndex} = tooltipItem;                            
            return tooltipItem.dataset.data[dataIndex] || '0';
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0)',
        bodyFont: {
          size: 24,
          weight: 'bold',
        },
        titleFont: {
          size: 36
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
        bodyColor: 'rgba(250, 250, 250, .9)',
        titleAlign: 'center',
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
        position: this.platform.isPortrait() ? 'bottom' : 'top',
        align: 'center',
        labels: {
          boxPadding: 10,
          borderRadius: 10,
          useBorderRadius: true,
          boxWidth: 20,
          boxHeight: 20,
          color: '#FF3F77'       
        }
      }
    }
  };
  
  public chartDatasets: ChartConfiguration<'radar'>['data']['datasets'] = [
    {
      data: [0, 1, 2, 3, 2, 4, 2, 1, 5, 4], 
      label: '70% Tanzania Kokoa Kamili',
      pointHoverRadius: 50,       
      tension: .24,
      
      showLine: true
      
    }
  ];
    
  public labels: Array<string> = [
    '🍫 Cacao',
    '🌰 Nut/Spice',
    '🥛 Dairy',
    '🍬 Sweet',
    '🌼 Floral',
    '🍍 Fruity',
    '🍋 Sour',
    '🪨 Earthy',
    '🥦 Vegetal',
    '🍞 Roasty '
  ];

  private tourOptions: JoyrideOptions = {
    steps: [
      'step1', //mainChart
      'step2', //add profile
      'step3', //profile modal origin
      'step4', //profile modal percent
      'step5', //profile flavors
      'step6'  //reset
    ],
    showCounter: false,
    themeColor: '#eeeeee',
    waitingTime: 400
  }

  private reminderOptions: JoyrideOptions = {
    steps: [ 'step2'],
    showPrevButton: false,
    showCounter: false,
    themeColor: '#eeeeee',
  }

  public stepContent: Array<string> = [
    `This spider chart will display your flavor profiles. 
    Tap the points for details and tap the origin to toggle it on/off`,
    'click here to add your new flavor profile',
    `Enter your chocolate's origin`,
    'Enter your chocolate percent. Default is 70',
    'Enter the levels of flavor you perceive, no wrong answers',
    'reset the the chart to start over',
  ];

  public isProfileModalOpen: boolean = false;
  public form!: FormGroup;
  public breakpoint: number;
  public introStatus: boolean = false;

  constructor(private modalCtrl: ModalController, 
              private alertCtrl: AlertController, 
              private platform: Platform,
              private fb: FormBuilder,
              private joyrideService: JoyrideService) {}

  async ngOnInit() {
    const screenHeight: number = this.platform.height();
    const screenWidth: number = this.platform.width();
    if (screenWidth < 576) this.breakpoint = (this.iOSMode ? 515 : 433) / screenHeight;
    else this.breakpoint = (this.iOSMode ? 294 : 265) / screenHeight;
    this.intializeProfileForm();
    this.introStatus = await this.getIntroductionStatus();
    if (!this.introStatus) this.startTour(this.tourOptions);
    else {
      this.startTour(this.reminderOptions);
      this.chartDatasets = [];
    }
  }

  intializeProfileForm() {
    this.form = this.fb.group({
      origin: ['', [Validators.required]],
      percent: [70, [Validators.required, Validators.min(37), Validators.max(100)]]
    });
    this.createFormControls(this.form);

    this.form.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe((values) => {
      Object.values<number>(values).slice(2).map((val, index: number) => {
        const currentControl: FormControl = this.form.controls[this.labels[index]] as FormControl;
        currentControl.setValue(val > 5 ? 5 : (val < 0 ? 0 : val), { emitEvent: false});
      });
    });
  }

  createFormControls(form: FormGroup) {
    this.labels.map((label) => {
      form.addControl(label, new FormControl('', [Validators.required, Validators.min(0), Validators.max(5)]))
    });
  }

  onDidDismiss(event: any) {
    //console.log(event);
  }

  async dismiss() {
    const top = await this.modalCtrl.getTop();
    top && await top.dismiss(this.form.valid ? this.form.value : null);
  }

  
  startTour(opts: JoyrideOptions) {
    setTimeout(() => this.joyrideService.startTour(opts), 200);
  }

  async setIntroductionStatus() {
    this.joyrideService.closeTour();
    this.chartDatasets = [];
    await Preferences.set({key: 'introCompleted', value: 'true'});
  }

  async getIntroductionStatus(): Promise<boolean> {
    const { value } = await Preferences.get({key: 'introCompleted'});
    return value === 'true';
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

  addToDataset() {
    this.closeProfileModal();
    let data: Array<number> = [];
    const { origin, percent } = this.form.value;
    console.log(this.form.value);
    Object.values(this.form.value).slice(2).forEach((p: any) => data.push(+p));
    console.log('data', data);
    const newDataset = {
      data,
      label: ` ${+percent}% ${origin}`,
      pointHoverRadius: 50,
      tension: .24
    };
    this.chartDatasets.push(newDataset);
    this.chartCanvas.chart?.data?.datasets?.push(newDataset);
    this.chartCanvas.chart?.update();
    this.form.reset();
    this.intializeProfileForm();
  }

  openProfileModal() {
    this.isProfileModalOpen = true;
  }
  closeProfileModal() {
    this.isProfileModalOpen = false;
  }

  async presentShareModal() {
    const base64Img: string = this.convertChartToBase64();
    const shareOptions: ShareOptions = {
      files: [base64Img],
      title: 'My Eldora Tasting Chart',
      text: "Here are the origins I tried and the flavors I picked up",
      dialogTitle: 'Share Chart'
    }

    const canShare: CanShareResult = await Share.canShare();
    (!canShare.value) ? this.browserShare(shareOptions) : Share.share(shareOptions);
  }

  private convertChartToBase64() {
    return this.chartCanvas.chart!.toBase64Image('image/webp', .8);
  }

  private base64ToBlob(base64: string) {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n) }

    return new Blob([u8arr], {type:mime});
  }

  private blobToFile(blob: Blob, fileName: string) {
    return new File([blob], fileName, { type: 'image/webp' })
  }

  private async browserShare(options: ShareOptions) {
    console.log('start');
    let {url, text, title, files: f } = options;
    const files = f.map((file: string) => this.blobToFile(this.base64ToBlob(file), `${title}.webp`));
    if (navigator.share) {
      try {
        await navigator.share({ url, text, title, files });
      }
      catch(err) { console.error('navigator share', err) }
    }
    else console.error('navigator share not available')
  }
}