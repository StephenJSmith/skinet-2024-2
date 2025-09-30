import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OrderService } from '../services/order.service';

export const orderCompleteGuard: CanActivateFn = (route, state) => {
  const orderService = inject(OrderService);
  const router = inject(Router);

  if (!orderService.orderComplete) {
    router.navigateByUrl('/shop');
    
    return false;
  }
  
  return true;
};
