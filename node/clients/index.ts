import { IOClients } from '@vtex/api'

import Status from './status'
import RequestHub from './../utils/Hub'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get status() {
    return this.getOrSet('status', Status)
  }

  public get hub(){
    return this.getOrSet('hub', RequestHub)
  }
}
