// Dependency Injection Container
// This file provides a simple service locator pattern for dependency injection

import { supabase } from '@data/datasources/remote/SupabaseClient';

// Import data sources
import { AuthRemoteDataSource } from '@data/datasources/remote/AuthRemoteDataSource';
import { CustomerRemoteDataSource } from '@data/datasources/remote/CustomerRemoteDataSource';
import { VehicleRemoteDataSource } from '@data/datasources/remote/VehicleRemoteDataSource';
import { OrderRemoteDataSource } from '@data/datasources/remote/OrderRemoteDataSource';
import { PaymentRemoteDataSource } from '@data/datasources/remote/PaymentRemoteDataSource';
import { AppointmentRemoteDataSource } from '@data/datasources/remote/AppointmentRemoteDataSource';
import { PhotoRemoteDataSource } from '@data/datasources/remote/PhotoRemoteDataSource';
import { ExpenseRemoteDataSource } from '@data/datasources/remote/ExpenseRemoteDataSource';

// Import repository implementations
import { AuthRepositoryImpl } from '@data/repositories/AuthRepositoryImpl';
import { CustomerRepositoryImpl } from '@data/repositories/CustomerRepositoryImpl';
import { VehicleRepositoryImpl } from '@data/repositories/VehicleRepositoryImpl';
import { ServiceOrderRepositoryImpl } from '@data/repositories/ServiceOrderRepositoryImpl';
import { PaymentRepositoryImpl } from '@data/repositories/PaymentRepositoryImpl';
import { AppointmentRepositoryImpl } from '@data/repositories/AppointmentRepositoryImpl';
import { PhotoRepositoryImpl } from '@data/repositories/PhotoRepositoryImpl';
import { ExpenseRepositoryImpl } from '@data/repositories/ExpenseRepositoryImpl';

// Import repository interfaces
import { IAuthRepository } from '@domain/repositories/IAuthRepository';
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';
import { IVehicleRepository } from '@domain/repositories/IVehicleRepository';
import { IServiceOrderRepository } from '@domain/repositories/IServiceOrderRepository';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository';
import { IPhotoRepository } from '@domain/repositories/IPhotoRepository';
import { IExpenseRepository } from '@domain/repositories/IExpenseRepository';

class DIContainer {
  private static instance: DIContainer;

  // Data sources (lazy initialized)
  private _authDataSource?: AuthRemoteDataSource;
  private _customerDataSource?: CustomerRemoteDataSource;
  private _vehicleDataSource?: VehicleRemoteDataSource;
  private _orderDataSource?: OrderRemoteDataSource;
  private _paymentDataSource?: PaymentRemoteDataSource;
  private _appointmentDataSource?: AppointmentRemoteDataSource;
  private _photoDataSource?: PhotoRemoteDataSource;
  private _expenseDataSource?: ExpenseRemoteDataSource;

  // Repositories (lazy initialized)
  private _authRepository?: IAuthRepository;
  private _customerRepository?: ICustomerRepository;
  private _vehicleRepository?: IVehicleRepository;
  private _orderRepository?: IServiceOrderRepository;
  private _paymentRepository?: IPaymentRepository;
  private _appointmentRepository?: IAppointmentRepository;
  private _photoRepository?: IPhotoRepository;
  private _expenseRepository?: IExpenseRepository;

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Data Sources
  get authDataSource(): AuthRemoteDataSource {
    if (!this._authDataSource) {
      this._authDataSource = new AuthRemoteDataSource(supabase);
    }
    return this._authDataSource;
  }

  get customerDataSource(): CustomerRemoteDataSource {
    if (!this._customerDataSource) {
      this._customerDataSource = new CustomerRemoteDataSource(supabase);
    }
    return this._customerDataSource;
  }

  get vehicleDataSource(): VehicleRemoteDataSource {
    if (!this._vehicleDataSource) {
      this._vehicleDataSource = new VehicleRemoteDataSource(supabase);
    }
    return this._vehicleDataSource;
  }

  get orderDataSource(): OrderRemoteDataSource {
    if (!this._orderDataSource) {
      this._orderDataSource = new OrderRemoteDataSource(supabase);
    }
    return this._orderDataSource;
  }

  get paymentDataSource(): PaymentRemoteDataSource {
    if (!this._paymentDataSource) {
      this._paymentDataSource = new PaymentRemoteDataSource(supabase);
    }
    return this._paymentDataSource;
  }

  get appointmentDataSource(): AppointmentRemoteDataSource {
    if (!this._appointmentDataSource) {
      this._appointmentDataSource = new AppointmentRemoteDataSource(supabase);
    }
    return this._appointmentDataSource;
  }

  get photoDataSource(): PhotoRemoteDataSource {
    if (!this._photoDataSource) {
      this._photoDataSource = new PhotoRemoteDataSource(supabase);
    }
    return this._photoDataSource;
  }

  get expenseDataSource(): ExpenseRemoteDataSource {
    if (!this._expenseDataSource) {
      this._expenseDataSource = new ExpenseRemoteDataSource(supabase);
    }
    return this._expenseDataSource;
  }

  // Repositories
  get authRepository(): IAuthRepository {
    if (!this._authRepository) {
      this._authRepository = new AuthRepositoryImpl(this.authDataSource);
    }
    return this._authRepository;
  }

  get customerRepository(): ICustomerRepository {
    if (!this._customerRepository) {
      this._customerRepository = new CustomerRepositoryImpl(this.customerDataSource);
    }
    return this._customerRepository;
  }

  get vehicleRepository(): IVehicleRepository {
    if (!this._vehicleRepository) {
      this._vehicleRepository = new VehicleRepositoryImpl(this.vehicleDataSource);
    }
    return this._vehicleRepository;
  }

  get orderRepository(): IServiceOrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = new ServiceOrderRepositoryImpl(
        this.orderDataSource,
        this.paymentDataSource,
        this.photoDataSource
      );
    }
    return this._orderRepository;
  }

  get paymentRepository(): IPaymentRepository {
    if (!this._paymentRepository) {
      this._paymentRepository = new PaymentRepositoryImpl(this.paymentDataSource);
    }
    return this._paymentRepository;
  }

  get appointmentRepository(): IAppointmentRepository {
    if (!this._appointmentRepository) {
      this._appointmentRepository = new AppointmentRepositoryImpl(this.appointmentDataSource);
    }
    return this._appointmentRepository;
  }

  get photoRepository(): IPhotoRepository {
    if (!this._photoRepository) {
      this._photoRepository = new PhotoRepositoryImpl(this.photoDataSource);
    }
    return this._photoRepository;
  }

  get expenseRepository(): IExpenseRepository {
    if (!this._expenseRepository) {
      this._expenseRepository = new ExpenseRepositoryImpl(this.expenseDataSource);
    }
    return this._expenseRepository;
  }

  // Reset all instances (useful for testing)
  public reset(): void {
    this._authDataSource = undefined;
    this._customerDataSource = undefined;
    this._vehicleDataSource = undefined;
    this._orderDataSource = undefined;
    this._paymentDataSource = undefined;
    this._appointmentDataSource = undefined;
    this._photoDataSource = undefined;
    this._expenseDataSource = undefined;
    this._authRepository = undefined;
    this._customerRepository = undefined;
    this._vehicleRepository = undefined;
    this._orderRepository = undefined;
    this._paymentRepository = undefined;
    this._appointmentRepository = undefined;
    this._photoRepository = undefined;
    this._expenseRepository = undefined;
  }
}

export const container = DIContainer.getInstance();
export default container;
