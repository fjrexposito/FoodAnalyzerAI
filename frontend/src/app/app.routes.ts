import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'food-analysis',
    loadComponent: () =>
      import('./features/foodAnalysis/containers/food-analysis.component').then( // Nueva ruta
        (m) => m.FoodAnalysisComponent
      ),
  },
  { path: '', redirectTo: '/food-analysis', pathMatch: 'full' }
];
