import { Injectable, signal, computed } from '@angular/core';
import { FawryMachineModel } from '../core/models/fawry-machine.model';
import { FawryMachineDetailsModel } from '../core/models/fawry-machine-details.model';

@Injectable({
  providedIn: 'root'
})
export class FawryMachinesStore {
  // Signals for state management
  private fawryMachinesSignal = signal<FawryMachineModel[]>([]);
  private fawryMachineDetailsSignal = signal<FawryMachineDetailsModel | null>(null);
  private loadingSignal = signal<boolean>(false);

  // Public readonly computed signals
  readonly fawryMachines = this.fawryMachinesSignal.asReadonly();
  readonly fawryMachineDetails = this.fawryMachineDetailsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  // Computed signals for derived state
  readonly fawryMachinesCount = computed(() => this.fawryMachinesSignal().length);
  readonly hasFawryMachines = computed(() => this.fawryMachinesSignal().length > 0);

  /**
   * Set the list of fawry machines
   */
  setFawryMachines(fawryMachines: FawryMachineModel[]): void {
    this.fawryMachinesSignal.set(fawryMachines);
  }

  /**
   * Set fawry machine details
   */
  setFawryMachineDetails(details: FawryMachineDetailsModel): void {
    this.fawryMachineDetailsSignal.set(details);
  }

  /**
   * Clear fawry machine details
   */
  clearFawryMachineDetails(): void {
    this.fawryMachineDetailsSignal.set(null);
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  /**
   * Add a new fawry machine to the list
   */
  addFawryMachine(fawryMachine: FawryMachineModel): void {
    this.fawryMachinesSignal.update(machines => [...machines, fawryMachine]);
  }

  /**
   * Update an existing fawry machine in the list
   */
  updateFawryMachine(updatedMachine: FawryMachineModel): void {
    this.fawryMachinesSignal.update(machines =>
      machines.map(machine => machine.Id === updatedMachine.Id ? updatedMachine : machine)
    );
  }

  /**
   * Remove a fawry machine from the list
   */
  removeFawryMachine(id: number): void {
    this.fawryMachinesSignal.update(machines =>
      machines.filter(machine => machine.Id !== id)
    );
  }

  /**
   * Clear all fawry machines
   */
  clearFawryMachines(): void {
    this.fawryMachinesSignal.set([]);
  }
}
