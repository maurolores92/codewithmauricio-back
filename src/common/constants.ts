export enum Status {
  INACTIVE= 0,
  ACTIVE = 1,
  DELETED = 2,
}

export const StateDetails: { [key in Status]: { id: number; name: string; color: string } } = {
  [Status.INACTIVE]: { id: Status.INACTIVE, name: "Inactivo", color: "warning" },
  [Status.ACTIVE]: { id: Status.ACTIVE, name: "Activo", color: "success" },
  [Status.DELETED]: { id: Status.DELETED, name: "Borrado", color: "error" },
};

export const Integrations: {[key: string]: any} = {
  AFIP: {name: 'AFIP', description: 'Integración para facturación electrónica AFIP', icon: 'arcticons:mi-afip'},
}

export const StatusIntegrations: {[key: string]: any} = {
  pending: { name: 'Pendiente', color: 'warning' },
  pending_approval: { name: 'Pendiente aprobación', color: 'info' },
  active: { name: 'Activo', color: 'success' },
  deactivated: { name: 'Desactivado', color: 'error' },
  pending_information: { name: 'Pendiente información', color: 'warning' },
}

export const TypeOfPayers: { [key: string]: { name: string } } = {
  monotributista: { name: 'Monotributista' },
  monotributista_responsable: { name: 'Monotributista responsable' },
  responsable_inscripto: { name: 'Responsable inscripto' },
};