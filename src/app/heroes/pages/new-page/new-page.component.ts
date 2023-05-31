import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit{

  public heroForm = new FormGroup({
    id:               new FormControl(''),
    superhero:        new FormControl<string>('',{nonNullable:true}), //esto siempre sera un string
    publisher:        new FormControl<Publisher>(Publisher.DCComics),
    alter_ego:        new FormControl(''),
    first_appearance: new FormControl(''),
    characters:       new FormControl(''),
    alt_img:          new FormControl(''),
  });

public publishers = [
  {id: 'DC Comics', desc: 'DC - Comics'},
  {id: 'Marvel Comics', desc: 'Marvel - Comics'},
];

constructor(
  private heroesService: HeroesService,
  //para traer informacion
  private activatedRoute: ActivatedRoute,
  // ESTO EN CASO QUE NO TUVIESE EL ID
  private router: Router,
  // esto es para mostrar mensajes
  private snackBar: MatSnackBar,
  // mensajes de confirmacion
  private dialog: MatDialog,
  ){}

get currentHero():Hero{
  const hero = this.heroForm.value as Hero;
  return hero;
}

// para ver si viene informacion
ngOnInit(): void {
  if(!this.router.url.includes('edit'))return;
  // cargar la informacion por el pipe
  this.activatedRoute.params
  .pipe(
    switchMap( ({id})  => this.heroesService.getHeroById(id)),
    //si no existe subscribe
    ).subscribe(hero => {
      if(!hero)return this.router.navigateByUrl('/'); // aqui saca si no existe
      this.heroForm.reset(hero); // aqui si existe creo****
      return;
    })
}



  onSubmit(): void {

    if (this.heroForm.invalid) return;

    if (this.currentHero.id) {
      this.heroesService.updateHero(this.currentHero)
        .subscribe( hero => {
          //mostrar snackbar
          this.showSnackBar(`${hero.superhero} updated!`);
        });
        return;
    }

    //craer un id

    this.heroesService.addHero(this.currentHero)
    .subscribe( hero => {
      this.router.navigate(['/heroes/edit',hero.id]);
      this.showSnackBar(`${hero.superhero} created!`);
    })
  }

  onDeleteHero(){
    if(!this.currentHero.id) throw Error ('Hero id is required');

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: this.heroForm.value,
      });

      dialogRef.afterClosed()
      .pipe(
        filter((result:boolean) => result), // para filtrar el resultado que quiere borrar
        // tap(result => console.log(result))
        switchMap( () => this.heroesService.deleteHerobyId(this.currentHero.id)),
        filter((wasDeleted:boolean) => wasDeleted), // aqui es si ya esta elimando
      )
      .subscribe(result => {
        this.router.navigate(['/heroes']);
      });


      // dialogRef.afterClosed().subscribe(result => {
      //   if(!result) return;
      //   this.heroesService.deleteHerobyId(this.currentHero.id)
      //   .subscribe(wasDeleted => {
      //     this.router.navigate(['/heroes']);
      //     console.log('deleted');})
      //   // this.heroForm = result;
      // });

  }

  // mostrar un mensaje
  showSnackBar(message:string):void{
    this.snackBar.open(message,'done',
    {
      duration:2500,
    })
  }

}
