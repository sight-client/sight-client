import { ErrorHandler, Injectable } from '@angular/core';
import chalk from 'chalk';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  handleError(error: any): void {
    if (error?.cause === 'red') {
      console.log(chalk.red(error.stack));
      return;
    } else if (error?.cause === 'yellow') {
      console.log(chalk.yellow(error.stack));
      return;
    } else if (error?.cause === 'green') {
      console.log(chalk.green(error.stack));
      return;
    } else if (error?.cause === 'blue') {
      console.log(chalk.blue(error.stack));
      return;
    }
    console.log(error);
    // Для ошибок валидации входных данных сетевых запросов с бэка
    if (error?.error?.message) {
      console.log(error.error.message);
    }
  }
}

// красный (red) - для критических ошибок кода,
// желтые (yellow) - для кастомных ошибок по вине сервера,
// зеленый (green) - для описания положительных результатов,
// синий (blue) - для информационных сообщений,
// фиолетовый (magenta) - запасной.
