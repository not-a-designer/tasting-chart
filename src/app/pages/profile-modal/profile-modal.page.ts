import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { debounceTime } from 'rxjs'

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.page.html',
  styleUrls: ['./profile-modal.page.scss'],
})
export class ProfileModalPage implements OnInit {
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

  form!: FormGroup;

  constructor(private modalCtrl: ModalController, private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      origin: ['', [Validators.required]],
      percentage: [70, [Validators.required, Validators.min(37), Validators.max(100)]]
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

  async dismiss() {
    const top = await this.modalCtrl.getTop();
    top && await top.dismiss(this.form.valid ? this.form.value : null);
  }

  createFormControls(form: FormGroup) {
    this.labels.map((label) => {
      form.addControl(label, new FormControl('', [Validators.required, Validators.min(0), Validators.max(5)]))
    });
  }

}
