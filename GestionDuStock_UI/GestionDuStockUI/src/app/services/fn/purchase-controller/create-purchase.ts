import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';
import { Purchase } from '../../models/purchase';

export interface CreatePurchase$Params {
  purchase: Purchase;  // Only the full purchase object here
}

export function createPurchase(http: HttpClient, rootUrl: string, params: CreatePurchase$Params, context?: HttpContext): Observable<StrictHttpResponse<Purchase>> {
  const rb = new RequestBuilder(rootUrl, createPurchase.PATH, 'post');
  if (params) {
    rb.body(params.purchase, 'application/json');  // Send the entire purchase object in the body
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Purchase>;
    })
  );
}

createPurchase.PATH = '/api/purchases';  // API endpoint for creating a purchase
