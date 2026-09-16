import { Routes } from '@angular/router';

import { Planet } from '@/planet';
// import { LandingPage } from '@landing/landing-page';

export const routes: Routes = [
  {
    // path: 'client', // нейтральный путь, но нужен хук с добавленем копии index.html под именем "404.html"
    // path: 'sight-client', // не выставлять, т.к. дублирует имя репозитория
    path: '', // подходит для github pages
    component: Planet,
    title: 'Sight: map',
  },
  // ---------------------------------------------------------------------------------------- //
  // {
  //   path: 'landing',
  //   // component: LandingPage,
  //   title: 'Sight: landing',
  //   loadComponent: () => import('./landing-page/landing-page').then((m) => m.LandingPage),
  //   children: [
  //     // {
  //     //   path: 'main',
  //     //   component: Main,
  //     // },
  //     // {
  //     //   path: 'news',
  //     //   component: News,
  //     // },
  //     // {
  //     //   path: 'contacts',
  //     //   component: Contacts,
  //     // },
  //     { path: '**', redirectTo: 'landing' },
  //   ],
  // },
  // ---------------------------------------------------------------------------------------- //
  // { path: '**', redirectTo: 'sight-client' }, // Wildcard - always last
  { path: '**', redirectTo: '' },
];
