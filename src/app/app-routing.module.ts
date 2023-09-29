import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { TetrisComponent } from './components/tetris/tetris.component';

const routes: Routes = [
  {
    path: 'tetris',
    component: TetrisComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
