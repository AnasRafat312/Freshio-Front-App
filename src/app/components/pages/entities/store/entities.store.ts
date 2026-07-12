import { Injectable, signal } from '@angular/core';
import { EntityModel } from 'src/app/shared/model/freshio/entity.model';

@Injectable({
  providedIn: 'root'
})
export class EntitiesStore {
  
  // Signal to store the entities list
  private entitiesSignal = signal<EntityModel[]>([]);
  
  // Read-only accessor for the signal
  readonly entities = this.entitiesSignal.asReadonly();

  // Signal to store entity details
  private entityDetailsSignal = signal<EntityModel | null>(null);
  
  // Read-only accessor for entity details
  readonly entityDetails = this.entityDetailsSignal.asReadonly();

  /**
   * Set the entities list
   * @param entities - Array of entity models
   */
  setEntities(entities: EntityModel[]): void {
    this.entitiesSignal.set(entities);
  }

  /**
   * Add a single entity to the list
   * @param entity - Entity model to add
   */
  addEntity(entity: EntityModel): void {
    this.entitiesSignal.update(entities => [...entities, entity]);
  }

  /**
   * Update an entity in the list
   * @param updatedEntity - Updated entity model
   */
  updateEntity(updatedEntity: EntityModel): void {
    this.entitiesSignal.update(entities => 
      entities.map(entity => 
        entity.ID === updatedEntity.ID ? updatedEntity : entity
      )
    );
  }

  /**
   * Remove an entity from the list
   * @param entityId - ID of the entity to remove
   */
  removeEntity(entityId: number): void {
    this.entitiesSignal.update(entities => 
      entities.filter(entity => entity.ID !== entityId)
    );
  }

  /**
   * Clear all entities
   */
  clearEntities(): void {
    this.entitiesSignal.set([]);
  }

  /**
   * Get current entities value (non-reactive)
   */
  getEntitiesValue(): EntityModel[] {
    return this.entitiesSignal();
  }

  /**
   * Set entity details
   * @param details - Entity details model
   */
  setEntityDetails(details: EntityModel): void {
    this.entityDetailsSignal.set(details);
  }

  /**
   * Clear entity details
   */
  clearEntityDetails(): void {
    this.entityDetailsSignal.set(null);
  }

  /**
   * Get current entity details value (non-reactive)
   */
  getEntityDetailsValue(): EntityModel | null {
    return this.entityDetailsSignal();
  }
}
