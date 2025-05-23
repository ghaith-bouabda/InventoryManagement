/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { PurchaseDto } from '../../models/purchase-dto';

export interface GetPurchaseBySupplier$Params {
  slug: string;
}

export function getPurchaseBySupplier(http: HttpClient, rootUrl: string, params: GetPurchaseBySupplier$Params, context?: HttpContext): Observable<StrictHttpResponse<PurchaseDto>> {
  const rb = new RequestBuilder(rootUrl, getPurchaseBySupplier.PATH, 'get');
  if (params) {
    rb.path('slug', params.slug, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<PurchaseDto>;
    })
  );
}

getPurchaseBySupplier.PATH = '/api/purchases/{slug}';
