import { Routes } from '@angular/router';

import { Planet } from '@/planet';
// import { LandingPage } from '@landing/landing-page';

export const routes: Routes = [
  {
    path: 'client',
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
  { path: '**', redirectTo: 'client' }, // Wildcard - always last
];
