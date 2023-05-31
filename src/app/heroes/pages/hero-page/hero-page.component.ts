import { Component, OnInit } from '@angular/core';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, switchMap } from 'rxjs';
import { Hero } from '../../interfaces/hero.interface';

@Component({
  selector: 'heroes-hero-page',
  templateUrl: './hero-page.component.html',
  styles: [
  ]
})
export class HeroPageComponent implements OnInit {

  public hero?: Hero;
  constructor(
    private heroesServices:HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.activatedRoute.params
    .pipe(
      delay(1000),
      switchMap(({id}) => this.heroesServices.getHeroById(id))
      //esto en caso de que no venga un heroe
    ).subscribe( hero =>
      {
        if (!hero) return this.router.navigate(['/heroes/list']);
        this.hero = hero;
        return;
  })

}
goBack():void{
  this.router.navigateByUrl('/heroes/list')
}
}
