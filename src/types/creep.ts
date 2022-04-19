export interface Identifiable {
  id: string | any
}

export interface Creep extends Identifiable {
  body: any[]
  carry: any
  carryCapacity: number
  fatigue: number
  hits: number
  hitsMax: number
  memory: any
  my: boolean
  name: string
  saying: string
  owner: string
  spawning: boolean
  store: any
  ticksToLive: number
  // attack(target: any): any
  // attackController(target: any): any
  // build(target: any): any
  // cancelOrder(target: any): any
  // claimController(target: any): any
  // dismantle(target: any): any
  // drop(resourceType: string, amount?: number): any
  // generateSafeMode(target: any): any
  // getActiveBodyparts(type: string): number
  // harvest(target: any): any
  // heal(target: any): any
  // move(direction: number): any
  // moveByPath(path: any): any
  // moveTo(x: number, y: number, opts?: any): any
  // moveTo(target: any, opts?: any): any
  // notifyWhenAttacked(enabled: boolean): any
  // pickup(target: any): any
  // rangedAttack(target: any): any
  // rangedHeal(target: any): any
  // rangedMassAttack(): any
  // repair(target: any): any
  // reserveController(target: any): any
  // say(message: string): any
  // signController(target: any, sign: string): any
}
