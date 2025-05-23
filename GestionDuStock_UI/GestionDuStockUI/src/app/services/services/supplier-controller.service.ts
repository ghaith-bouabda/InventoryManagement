/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createFournisseur } from '../fn/supplier-controller/create-fournisseur';
import { CreateFournisseur$Params } from '../fn/supplier-controller/create-fournisseur';
import { deleteFournisseur } from '../fn/supplier-controller/delete-fournisseur';
import { DeleteFournisseur$Params } from '../fn/supplier-controller/delete-fournisseur';
import { getAllFournisseurs } from '../fn/supplier-controller/get-all-fournisseurs';
import { GetAllFournisseurs$Params } from '../fn/supplier-controller/get-all-fournisseurs';
import { getFournisseur } from '../fn/supplier-controller/get-fournisseur';
import { GetFournisseur$Params } from '../fn/supplier-controller/get-fournisseur';
import { SupplierDto } from '../models/supplier-dto';
import { updateFournisseur } from '../fn/supplier-controller/update-fournisseur';
import { UpdateFournisseur$Params } from '../fn/supplier-controller/update-fournisseur';

@Injectable({ providedIn: 'root' })
export class SupplierControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  static readonly GetFournisseurPath = '/Supplier/{slug}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFournisseur()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSupplier$Response(params: GetFournisseur$Params, context?: HttpContext): Observable<StrictHttpResponse<SupplierDto>> {
    return getFournisseur(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getFournisseur$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSupplier(params: GetFournisseur$Params, context?: HttpContext): Observable<SupplierDto> {
    return this.getSupplier$Response(params, context).pipe(
      map((r: StrictHttpResponse<SupplierDto>): SupplierDto => r.body)
    );
  }

  /** Path part for operation `updateFournisseur()` */
  static readonly UpdateFournisseurPath = '/Supplier/{slug}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateFournisseur()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateSupplier$Response(params: UpdateFournisseur$Params, context?: HttpContext): Observable<StrictHttpResponse<SupplierDto>> {
    return updateFournisseur(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateFournisseur$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateSupplier(params: UpdateFournisseur$Params, context?: HttpContext): Observable<SupplierDto> {
    return this.updateSupplier$Response(params, context).pipe(
      map((r: StrictHttpResponse<SupplierDto>): SupplierDto => r.body)
    );
  }

  /** Path part for operation `deleteFournisseur()` */
  static readonly DeleteFournisseurPath = '/Supplier/{slug}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteFournisseur()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteSupplier$Response(params: DeleteFournisseur$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deleteFournisseur(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteFournisseur$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteSupplier(params: DeleteFournisseur$Params, context?: HttpContext): Observable<void> {
    return this.deleteSupplier$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `createFournisseur()` */
  static readonly CreateFournisseurPath = '/Supplier';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createFournisseur()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createSupplier$Response(params: CreateFournisseur$Params, context?: HttpContext): Observable<StrictHttpResponse<SupplierDto>> {
    return createFournisseur(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createFournisseur$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createSupplier(params: CreateFournisseur$Params, context?: HttpContext): Observable<SupplierDto> {
    return this.createSupplier$Response(params, context).pipe(
      map((r: StrictHttpResponse<SupplierDto>): SupplierDto => r.body)
    );
  }

  /** Path part for operation `getAllFournisseurs()` */
  static readonly GetAllFournisseursPath = '/Supplier/';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllFournisseurs()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllSuppliers$Response(params?: GetAllFournisseurs$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<SupplierDto>>> {
    return getAllFournisseurs(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getAllFournisseurs$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllSuppliers(params?: GetAllFournisseurs$Params, context?: HttpContext): Observable<Array<SupplierDto>> {
    return this.getAllSuppliers$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<SupplierDto>>): Array<SupplierDto> => r.body)
    );
  }

}
